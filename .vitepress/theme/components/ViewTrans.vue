<script setup lang="ts">
import { useData } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { nextTick, provide, useSlots } from "vue";

const { isDark } = useData();
const slots = useSlots();

const enableTransitions = () =>
	typeof document !== "undefined" &&
	"startViewTransition" in document &&
	window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

provide("toggle-appearance", (event?: MouseEvent) => {
	if (!enableTransitions()) {
		isDark.value = !isDark.value;
		return;
	}

	let clientX = event?.clientX;
	let clientY = event?.clientY;

	if ((!clientX && !clientY) || (clientX === 0 && clientY === 0)) {
		const switchEl = document.querySelector(".VPSwitchAppearance");
		if (switchEl) {
			const rect = switchEl.getBoundingClientRect();
			clientX = rect.left + rect.width / 2;
			clientY = rect.top + rect.height / 2;
		} else {
			clientX = window.innerWidth / 2;
			clientY = window.innerHeight / 2;
		}
	}

	const x = (100 * clientX) / window.innerWidth;
	const y = (100 * clientY) / window.innerHeight;
	const maxRadius =
		(100 *
			Math.hypot(
				Math.max(clientX, window.innerWidth - clientX),
				Math.max(clientY, window.innerHeight - clientY),
			)) /
		(Math.hypot(window.innerWidth, window.innerHeight) / Math.SQRT2);

	document.documentElement.style.setProperty("--switch-x", `${x}%`);
	document.documentElement.style.setProperty("--switch-y", `${y}%`);
	document.documentElement.style.setProperty("--switch-r", `${maxRadius}%`);

	document.startViewTransition(async () => {
		isDark.value = !isDark.value;
		await nextTick();
	});
});
</script>

<template>
  <DefaultTheme.Layout>
    <template v-for="(_, name) in slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </DefaultTheme.Layout>
</template>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root) {
  z-index: 1;
}

::view-transition-new(root) {
  z-index: 9999;
  animation: switch-appearance 350ms ease-in-out;
}

.dark::view-transition-old(root) {
  z-index: 9999;
  animation: switch-appearance 350ms ease-in-out reverse forwards;
}

.dark::view-transition-new(root) {
  z-index: 1;
  animation: none;
}

@keyframes switch-appearance {
  from {
    clip-path: circle(0 at var(--switch-x) var(--switch-y));
  }
  to {
    clip-path: circle(var(--switch-r) at var(--switch-x) var(--switch-y));
  }
}
</style>
