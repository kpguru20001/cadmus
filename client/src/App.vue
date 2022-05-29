<script setup lang="ts">
import { RouterView } from "vue-router";
import type { GlobalThemeOverrides } from "naive-ui";
import { NConfigProvider, darkTheme, NGlobalStyle } from "naive-ui";

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#FFD43A",
    primaryColorHover: "#FFE26B",
    primaryColorPressed: "#DBB02A",
    fontFamily: "Poppins, Karla",
    borderRadius: "6px",
  },
  Card: {
    color: "#0d0d0d",
  },
};
</script>

<template>
  <n-config-provider
    class="tw-h-full tw-font-poppins"
    :theme-overrides="themeOverrides"
    :theme="darkTheme"
  >
    <RouterView />
    <n-global-style />
  </n-config-provider>
</template>

<style>
@import "@/assets/base.css";

#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  font-weight: normal;
  height: 100%;
}
</style>
