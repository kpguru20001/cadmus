<script setup lang="ts">
import { NButton, NIcon } from "naive-ui";
import { LinkSquare16Regular } from "@vicons/fluent";
</script>
<template>
  <main class="h-full">
    <div
      class="h-full w-full flex flex-row flex-nowrap justify-center items-center"
    >
      <div
        class="max-w-sm w-full rounded flex flex-col flex-nowrap justify-center items-center bg-raisinBlack-80 py-6 px-8"
      >
        <h1 class="text-h2 font-bold text-cyberYellow-100">DeEasy</h1>
        <div class="text-subtitle1 font-semibold">
          A simpler new world order
        </div>
        <n-button
          type="primary"
          :ghost="false"
          block
          strong
          class="bg-cyberYellow-100 mt-4"
          ><template #icon>
            <n-icon>
              <link-square-16-regular />
            </n-icon> </template
          >Connect you wallet</n-button
        >
      </div>
    </div>
  </main>
</template>
