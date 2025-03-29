<template>
  <a-modal
    v-model:visible="visible"
    :title="mappedPosition?.source ?? '源码'"
    title-align="start"
    width="auto"
    :footer="false"
  >
    <div class="code" ref="codeRef">
      <div
        v-for="(item, i) in sourceCode.split('\n')"
        :key="i"
        :class="mappedPosition?.line == i + 1 ? 'highlight' : ''"
      >
        <span class="index">{{ i + 1 }}</span>
        <code>{{ item }}</code>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
  import { nextTick, ref } from 'vue';
  import { MappedPosition, SourceMapConsumer, RawSourceMap } from 'source-map-js';

  const visible = ref(false);

  const mappedPosition = ref<MappedPosition>();
  const sourceCode = ref('');
  const codeRef = ref();

  const openDialog = () => {
    const rawSourceMap = JSON.parse(
      `{"version":3,"file":"index-b78d3956.js","sources":["../../src/views/mock/index.vue"],"sourcesContent":["<template>\\n  <div class=\\"manage\\">\\n    <a-button v-log=\\"'按钮1'\\">声明式</a-button>\\n    <a-button @click=\\"onAction\\">命令式</a-button>\\n\\n    <a-button @click=\\"onCodeError\\">代码错误</a-button>\\n    <a-button @click=\\"onRejectError\\">异步未捕获错误1</a-button>\\n    <a-button @click=\\"onRejectError2\\">异步未捕获错误2</a-button>\\n  </div>\\n</template>\\n\\n\x3Cscript lang=\\"js\\" setup>\\n  import { inject } from 'vue';\\n  // import { Button as AButton } from '@arco-design/web-vue';\\n\\n  const $tracker = inject('$tracker');\\n\\n  const onAction = () => {\\n    console.log($tracker);\\n    $tracker.addActionLog({a:1,b:'222'});\\n  };\\n\\n  const onCodeError = () => {\\n    const a = {};\\n    // @ts-ignore\\n    a.split('/');\\n  };\\n\\n  const onRejectError = () => {\\n    const p = () =>\\n      new Promise((resolve, reject) => {\\n        reject('promise reject');\\n      });\\n    p().then((res) => {\\n      console.log('res', res);\\n    });\\n  };\\n\\n  const onRejectError2 = () => {\\n    const p = () =>\\n      Promise.resolve().then(() => {\\n        const a = {};\\n        // @ts-ignore\\n        a.customFn('/');\\n      });\\n    p().then((res) => {\\n      console.log('res', res);\\n    });\\n  }\\n\x3C/script>\\n\\n<style lang=\\"scss\\" scoped>\\n  .manage {\\n    display: flex;\\n    flex-direction: column;\\n    align-items: center;\\n  }\\n</style>\\n"],"names":["$tracker","inject","onAction","addActionLog","a","b","onCodeError","split","onRejectError","p","Promise","resolve","reject","then","res","onRejectError2","customFn"],"mappings":"qMAeE,MAAMA,EAAWC,EAAO,UAAU,EAE5BC,EAAWA,IAAM,CAErBF,EAASG,aAAa,CAACC,EAAE,EAAEC,EAAE,KAAK,CAAC,GAG/BC,EAAcA,IAAM,EACd,CAAA,GAERC,MAAM,GAAG,GAGPC,EAAgBA,IAAM,EAChBC,IACR,IAAIC,QAAQ,CAACC,EAASC,IAAW,CAC/BA,EAAO,gBAAgB,CACzB,CAAC,GACA,EAACC,KAAMC,GAAQ,CAElB,CAAC,GAGGC,EAAiBA,IAAM,EACjBN,IACRC,QAAQC,QAAS,EAACE,KAAK,IAAM,EACjB,CAAA,GAERG,SAAS,GAAG,CAChB,CAAC,GACA,EAACH,KAAMC,GAAQ,CAElB,CAAC"}`
    ) as RawSourceMap;
    const smc = new SourceMapConsumer(rawSourceMap);
    const position = smc.originalPositionFor({
      line: 1,
      column: 397,
    });

    const index = rawSourceMap.sources.findIndex((v) => v === position.source);
    if (index != -1 && rawSourceMap.sourcesContent) {
      sourceCode.value = rawSourceMap.sourcesContent[index];
      mappedPosition.value = position;
      // 自动定位
      nextTick(() => {
        codeRef.value.children[position.line].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      });
    }
    console.log(rawSourceMap, position);

    visible.value = true;
  };

  defineExpose({
    openDialog,
  });
</script>

<style lang="scss" scoped>
  .index {
    font-size: 12px;
    display: inline-block;
    width: 18px;
    padding: 0 10px;
    color: gray;
    box-sizing: content-box;
    text-align: center;
  }

  .code {
    max-height: 60vh;
  }

  .highlight {
    background-color: #f4433661;
  }
</style>
