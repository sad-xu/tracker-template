<template>
  <div class="home">
    <div style="margin-bottom: 24px">当前环境：{{ currentEnv ?? '--' }}</div>
    <a-button style="margin-bottom: 24px" type="primary" @click="onToggle">
      切换为{{ currentEnv == 'gray' ? '正常环境' : '灰度环境' }}
    </a-button>
    <a-button style="margin-bottom: 24px" type="primary" @click="onSendApi">api请求</a-button>
    test1
  </div>
</template>

<script setup>
  import { KAYOUCTX_NAMESPACE, setCookie, deleteCookie, currentEnv } from '@/utils/cookie';
  import { test } from '@/api';

  const onToggle = () => {
    if (currentEnv == 'gray') {
      deleteCookie(KAYOUCTX_NAMESPACE);
    } else {
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 10);
      setCookie(KAYOUCTX_NAMESPACE, 'gray', expires);
    }
    //刷新
    window.location.reload();
  };

  const onSendApi = () => {
    test();
  };
</script>

<style lang="scss" scoped>
  .home {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
