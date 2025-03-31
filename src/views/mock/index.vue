<template>
  <div class="manage">
    <a-space style="margin: 20px 0 20px">
      <a-button v-log="'按钮1'">声明式</a-button>
      <a-button @click="onAction">命令式</a-button>
    </a-space>
    <a-space style="margin-bottom: 20px">
      <a-button @click="onCodeError">代码错误</a-button>
      <a-button @click="onRejectError">异步未捕获错误1</a-button>
      <a-button @click="onRejectError2">异步未捕获错误2</a-button>
    </a-space>
    <a-space>
      <a-button @click="onRejectError3">异步已捕获错误</a-button>
      <a-button @click="onCodeError2">已捕获代码错误</a-button>
      <a-button @click="onCodeError3">覆盖Error</a-button>
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

  const onRejectError3 = () => {
    const p = () =>
      Promise.resolve().then(() => {
        const a = {};
        // @ts-ignore
        a.customFn('/');
      });
    p().then((res) => {
      console.log('res', res);
    }).catch(e => {
      console.log('err', e)
    });
  }

  const onCodeError2 = () => {
    try {
      const a = {};
      // @ts-ignore
      a.split('/');
    } catch(e) {
      console.log('trycatch:', e)
    }
  }

  const onCodeError3 = () => {
    try {
      throw new Error('aaa')
    } catch(e) {
      console.log('trycatch:', e)
    }
  }
</script>

<style lang="scss" scoped>
  .manage {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
