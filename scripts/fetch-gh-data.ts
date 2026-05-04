/**
 * 从 GitHub API 获取贡献者和发布数据，保存到 src/public/ghdata.json
 *
 * 贡献者数据通过 GraphQL API 统计 master 分支上的非 merge 提交，
 * 与 GitHub /graphs/contributors 页面的计数方式一致。
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

config();

const OUTPUT_FILE = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"src",
	"public",
	"ghdata.json",
);
const REPO = { owner: "LanRhyme" as const, name: "MicYou" as const };
const EXCLUDE_USERS = new Set([
	"LanRhyme",
	"ChinsaaWei",
	"dependabot[bot]",
	"crowdin-bot",
	"github-actions[bot]",
]);

interface OutputData {
	version: string;
	releaseUrl: string;
	releaseDate: string;
	releaseNotes: string;
	contributors: Array<{
		login: string;
		avatar_url: string;
		html_url: string;
		contributions: number;
	}>;
	fetchedAt: string;
}

interface GraphQLResponse<T = Record<string, unknown>> {
	data?: T;
}

interface ReleaseResponse {
	repository: {
		latestRelease: {
			tagName: string;
			publishedAt: string;
			url: string;
			description: string;
		} | null;
	};
}

interface CommitHistoryResponse {
	repository: {
		defaultBranchRef: {
			target: {
				history: {
					pageInfo: { hasNextPage: boolean; endCursor: string };
					nodes: Array<{
						author: {
							user: {
								login: string;
								avatarUrl: string;
								url: string;
							} | null;
						} | null;
						parents: { totalCount: number };
					}>;
				};
			};
		};
	};
}

async function fetchGraphQL<T = unknown>(
	query: string,
	variables: Record<string, string | null>,
	token: string,
): Promise<GraphQLResponse<T>> {
	const res = await fetch("https://api.github.com/graphql", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ query, variables }),
	});
	if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
	return res.json();
}

async function main() {
	const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
	if (!token) {
		console.error("Error: Set GH_TOKEN or GITHUB_TOKEN environment variable.");
		process.exit(1);
	}

	console.log("Fetching GitHub data...");

	try {
		// 获取 release
		const releaseRes: GraphQLResponse<ReleaseResponse> =
			await fetchGraphQL<ReleaseResponse>(
				`query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          latestRelease { tagName publishedAt url description }
        }
      }`,
				REPO,
				token,
			);
		const release = releaseRes.data?.repository?.latestRelease;
		if (!release) throw new Error("No releases found");

		// 统计 master 分支上的非 merge 提交（与 GitHub /graphs/contributors 一致）
		console.log("Counting commits on master (excluding merges)...");
		const QUERY = `
      query($owner: String!, $name: String!, $after: String) {
        repository(owner: $owner, name: $name) {
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 100, after: $after) {
                  pageInfo { hasNextPage endCursor }
                  nodes {
                    author { user { login avatarUrl url } }
                    parents { totalCount }
                  }
                }
              }
            }
          }
        }
      }
    `;

		type ContributorEntry = OutputData["contributors"][number];
		const contributorMap = new Map<string, ContributorEntry>();
		let after: string | null = null;
		let page = 0;
		let totalCommits = 0;
		let mergeSkipped = 0;

		while (true) {
			page++;
			const res: GraphQLResponse<CommitHistoryResponse> =
				await fetchGraphQL<CommitHistoryResponse>(
					QUERY,
					{ ...REPO, after },
					token,
				);
			const history = res.data?.repository?.defaultBranchRef?.target?.history;
			if (!history) break;
			for (const node of history.nodes) {
				// 跳过 merge commit（有多个 parent）
				if (node.parents?.totalCount > 1) {
					mergeSkipped++;
					continue;
				}
				const u = node.author?.user;
				totalCommits++;
				if (
					!u?.login ||
					EXCLUDE_USERS.has(u.login) ||
					u.login.includes("[bot]")
				)
					continue;
				const existing = contributorMap.get(u.login);
				if (existing) existing.contributions++;
				else
					contributorMap.set(u.login, {
						login: u.login,
						avatar_url: u.avatarUrl,
						html_url: u.url,
						contributions: 1,
					});
			}
			console.log(
				`  Page ${page}: ${totalCommits} commits (+${mergeSkipped} merges skipped)`,
			);
			if (!history.pageInfo.hasNextPage) break;
			after = history.pageInfo.endCursor;
		}

		const contributors = Array.from(contributorMap.values()).sort(
			(a, b) => b.contributions - a.contributions,
		);

		const newData = {
			version: release.tagName.replace(/^v/, ""),
			releaseUrl: release.url,
			releaseDate: release.publishedAt,
			releaseNotes: release.description || "",
			contributors,
		};

		// 检查是否有变化
		if (existsSync(OUTPUT_FILE)) {
			const existing: OutputData = JSON.parse(
				readFileSync(OUTPUT_FILE, "utf-8"),
			);
			if (
				existing.version === newData.version &&
				JSON.stringify(existing.contributors) ===
					JSON.stringify(newData.contributors)
			) {
				console.log(
					`✓ Version: ${newData.version}, Contributors: ${newData.contributors.length} (no changes)`,
				);
				return;
			}
		}

		writeFileSync(
			OUTPUT_FILE,
			JSON.stringify(
				{ ...newData, fetchedAt: new Date().toISOString() },
				null,
				2,
			),
		);
		console.log(
			`✓ Version: ${newData.version}, Contributors: ${newData.contributors.length}`,
		);
	} catch (error) {
		console.error("Failed:", error);
		process.exit(1);
	}
}

main();
