<template>
  <div class="manage">
    <a-space style="margin-bottom: 20px">
      <a-button v-log="'按钮1'">声明式</a-button>
      <a-button @click="onAction">命令式</a-button>
    </a-space>
    <a-space>
      <a-button @click="onCodeError">代码错误</a-button>
      <a-button @click="onRejectError">异步未捕获错误1</a-button>
      <a-button @click="onRejectError2">异步未捕获错误2</a-button>
    </a-space>
  </div>
</template>

<script lang="js" setup>
  import { inject } from 'vue';
  // import { Button as AButton } from '@arco-design/web-vue';

  const $tracker = inject('$tracker');

  const onAction = () => {
    console.log($tracker);
    $tracker.addActionLog({a:1,b:'222'});
  };

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

  const onRejectError2 = () => {
    const p = () =>
      Promise.resolve().then(() => {
        const a = {};
        // @ts-ignore
        a.customFn('/');
      });
    p().then((res) => {
      console.log('res', res);
    });
  }
</script>

<style lang="scss" scoped>
  .manage {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
