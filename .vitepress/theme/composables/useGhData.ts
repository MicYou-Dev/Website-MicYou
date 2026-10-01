import { readonly, ref } from "vue";

export interface Contributor {
	login: string;
	avatar_url: string;
	html_url: string;
	contributions: number;
}

export interface GhData {
	version: string;
	releaseUrl?: string;
	releaseDate?: string;
	releaseNotes?: string;
	contributors: Contributor[];
	fetchedAt?: string;
}

const ghData = ref<GhData>({
	version: "",
	contributors: [],
});

const isLoaded = ref(false);
const isLoading = ref(false);
let fetchPromise: Promise<GhData | null> | null = null;

export function useGhData() {
	async function loadGhData() {
		if (typeof window === "undefined") return null;
		if (isLoaded.value) return ghData.value;
		if (fetchPromise) return fetchPromise;

		isLoading.value = true;
		fetchPromise = (async () => {
			try {
				const res = await fetch(`/ghdata.json?t=${Date.now()}`);
				if (res.ok) {
					const data = (await res.json()) as GhData;
					ghData.value = data;
					isLoaded.value = true;
					return data;
				}
			} catch {
				// 静默失败，保持默认值
			} finally {
				isLoading.value = false;
				fetchPromise = null;
			}
			return null;
		})();

		return fetchPromise;
	}

	return {
		ghData: readonly(ghData),
		isLoaded: readonly(isLoaded),
		isLoading: readonly(isLoading),
		loadGhData,
	};
}
