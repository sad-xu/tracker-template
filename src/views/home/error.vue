<template>
  <div>
    <a-button @click="getMapFile">获取map</a-button>
    <a-table :data="tableData">
      <template #columns>
        <a-table-column title="AppId" align="center" :width="120">
          <template #cell="{ record }"> {{ record.appId }} </template>
        </a-table-column>
        <a-table-column title="错误类型" align="center" :width="120">
          <template #cell="{ record }"> {{ record.errType }} </template>
        </a-table-column>
        <a-table-column title="错误详情">
          <template #cell="{ record }">
            <div><b>msg</b>: {{ record.msg || '--' }}</div>
            <div><b>stack</b>: {{ record.stack || '--' }}</div>
            <div><b>extra</b>: {{ record.extra || '--' }}</div>
          </template>
        </a-table-column>
        <a-table-column title="记录时间" :width="220">
          <template #cell="{ record }">
            {{ dateFormat(record.time) }}
          </template>
        </a-table-column>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { getLogList, getSourceMap } from '@/api';
  import { dateFormat } from '@/utils';

  const tableData = ref([]);

  onMounted(() => {
    init();
  });

  const init = () => {
    getLogList('error').then((res) => {
      tableData.value = [
        ...res.data,
        ...[
          {
            type: 'error',
            errType: 'reject',
            msg: '{}.customFn is not a function',
            stack:
              'TypeError: {}.customFn is not a function\n    at https://fffff.games/tracker/assets/index-b78d3956.js:1:397',
            extra: '',
            appId: 1,
            time: 1743147016472,
          },
          {
            type: 'error',
            errType: 'reject',
            msg: 'a.customFn is not a function',
            stack:
              'TypeError: a.customFn is not a function\n    at http://localhost:8777/tracker/src/views/mock/index.vue?t=1743145873599:37:11',
            extra: '',
            appId: 1,
            time: 1743145989496,
          },
          {
            type: 'error',
            errType: 'reject',
            msg: 'promise reject',
            stack: '',
            extra: '',
            appId: 1,
            time: 1743145464592,
          },
          {
            type: 'error',
            errType: 'code',
            msg: 'a.split is not a function',
            stack:
              'TypeError: a.split is not a function\n    at onCodeError (http://localhost:8777/tracker/src/views/mock/index.vue:23:9)\n    at callWithErrorHandling (http://localhost:8777/tracker/node_modules/.vite/deps/chunk-YQMWPVX7.js?v=1be96ec5:1565:18)\n    at callWithAsyncErrorHandling (http://localhost:8777/tracker/node_modules/.vite/deps/chunk-YQMWPVX7.js?v=1be96ec5:1573:17)\n    at emit (http://localhost:8777/tracker/node_modules/.vite/deps/chunk-YQMWPVX7.js?v=1be96ec5:2074:5)\n    at http://localhost:8777/tracker/node_modules/.vite/deps/chunk-YQMWPVX7.js?v=1be96ec5:8817:45\n    at Proxy.handleClick (http://localhost:8777/tracker/node_modules/.vite/deps/@arco-design_web-vue.js?v=1be96ec5:3801:7)\n    at _ctx.href.createElementBlock.onClick._cache.<computed>._cache.<computed> (http://localhost:8777/tracker/node_modules/.vite/deps/@arco-design_web-vue.js?v=1be96ec5:3842:78)\n    at callWithErrorHandling (http://localhost:8777/tracker/node_modules/.vite/deps/chunk-YQMWPVX7.js?v=1be96ec5:1565:18)\n    at callWithAsyncErrorHandling (http://localhost:8777/tracker/node_modules/.vite/deps/chunk-YQMWPVX7.js?v=1be96ec5:1573:17)\n    at HTMLButtonElement.invoker (http://localhost:8777/tracker/node_modules/.vite/deps/chunk-YQMWPVX7.js?v=1be96ec5:9397:5)',
            extra: 'component event handler',
            appId: 1,
            time: 1743145463599,
          },
        ],
      ] as any;
    });
  };

  const getMapFile = () => {
    getSourceMap({
      fileName: 'index-b78d3956.js.map',
      env: 'development',
    }).then((rawSourceMap) => {
      console.log(rawSourceMap);
      // const smc = new SourceMapConsumer(rawSourceMap);
      // const originPosition = smc.originalPositionFor({
      //   line: 2,
      //   column: 28
      // })
    });
  };

  /** 匹配 */
  const matchReg = (stack: String) => {
    const list = stack.match(/at\s+.*\s+\((.*):(\d+):(\d+)\)/g);
  };

  /** 定位源码 */
  const parseError = () => {};
</script>
