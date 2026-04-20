/**
 * 从 GitHub GraphQL API 获取贡献者和发布数据，保存到 src/ghdata.json
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
	"ghdata.json",
);
const REPO = { owner: "LanRhyme", name: "MicYou" };
const EXCLUDE_USERS = new Set([
	"LanRhyme",
	"ChinsaaWei",
	"dependabot[bot]",
	"crowdin-bot",
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

// 合并的 GraphQL 查询
const QUERY = `
  query($owner: String!, $name: String!, $after: String) {
    repository(owner: $owner, name: $name) {
      latestRelease {
        tagName
        publishedAt
        url
        description
      }
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: 100, after: $after) {
              pageInfo { hasNextPage endCursor }
              nodes {
                author { user { login avatarUrl url } }
              }
            }
          }
        }
      }
    }
  }
`;

async function fetchGraphQL(
	query: string,
	variables: Record<string, string | null>,
	token: string,
) {
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
	// 支持 GH_TOKEN 或 GITHUB_TOKEN（GitHub Actions 默认提供）
	const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
	if (!token) {
		console.error("Error: Set GH_TOKEN or GITHUB_TOKEN environment variable.");
		process.exit(1);
	}

	console.log("Fetching GitHub data...");

	try {
		// 获取 release
		const releaseRes = await fetchGraphQL(
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

		// 分页获取所有 commits
		const commits: Array<{
			author?: {
				user?: { login: string; avatarUrl: string; url: string } | null;
			} | null;
		}> = [];
		let after: string | null = null;
		let page = 0;

		while (true) {
			page++;
			const res = await fetchGraphQL(QUERY, { ...REPO, after }, token);
			const history = res.data?.repository?.defaultBranchRef?.target?.history;
			if (!history) break;
			commits.push(...history.nodes);
			console.log(`  Page ${page}: ${commits.length} commits`);
			if (!history.pageInfo.hasNextPage) break;
			after = history.pageInfo.endCursor;
		}

		// 统计贡献者
		const contributorMap = new Map<
			string,
			{
				login: string;
				avatar_url: string;
				html_url: string;
				contributions: number;
			}
		>();
		for (const c of commits) {
			const u = c.author?.user;
			if (!u?.login || EXCLUDE_USERS.has(u.login) || u.login.includes("[bot]"))
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
