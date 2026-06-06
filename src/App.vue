<template>
  <AppLayout />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppLayout from '@/components/layout/AppLayout.vue';
import { useAppName } from './composables/useAppName';

const router = useRouter();

onMounted(() => {
  const { appName } = useAppName();

  // 初始化用户信息
  // if (userStore.token) {
  //   // 可以在这里添加 token 刷新逻辑
  // }

  // 全局后置钩子
  router.afterEach((_to, _from) => {
    // 标题
    document.title = appName.value || '糖果'
  })
})
</script>

<style lang="scss">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f0f2f5;
  color: #333;
}

#app {
  min-height: 100vh;
}
</style>
