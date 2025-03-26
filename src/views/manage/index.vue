<template>
  <div class="manage">
    <a-button v-log="'按钮1'">声明式</a-button>

    <a-button @click="onCodeError">代码错误</a-button>
    <a-button @click="onRejectError">异步未捕获错误</a-button>
  </div>
</template>

<script lang="ts" setup>
  import { Button as AButton } from '@arco-design/web-vue';

  const onCodeError = () => {
    const a = {};
    // @ts-ignore
    a.split('/');
  };

  const onRejectError = () => {
    const p = () =>
      new Promise((resolve, reject) => {
        reject('promise reject');
      });
    p().then((res) => {
      console.log('res', res);
    });
  };
</script>

<style lang="scss" scoped>
  .manage {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
