<template>
  <div style="display: flex; justify-content: center; padding-top: 30px">
    <a-timeline labelPosition="relative">
      <a-timeline-item
        v-for="(item, i) in footprint"
        :key="i"
        :label="new Date(item.time).toLocaleString()"
        :dot-color="dotColorMap[item.type]"
      >
        {{ item.desc }}
        <div style="font-size: 13px; color: #9e9e9e">
          <template v-if="item.type === 'pageIn'">
            <div>from: {{ item.from }}</div>
            <div>to: {{ item.to }}</div>
          </template>
          <template v-else-if="item.type === 'api'">
            {{ item.api }}
          </template>
          <template v-else-if="item.type === 'apiError'">
            {{ item.api }}
            <div><b>message</b>: {{ item.message || '--' }}</div>
            <div><b>error</b>: {{ item.error || '--' }}</div>
            <div><b>logName</b>: {{ item.loggerName || '--' }}</div>
          </template>
          <template v-else-if="item.type === 'action'">
            {{ item.info }}
          </template>
          <template v-else-if="item.type === 'error'">
            <div><b>message</b>: {{ item.message || '--' }}</div>
            <div>
              <b>stack</b>:
              <template v-for="(line, i) in formatStack(item.stack || '--')" :key="i">
                <div v-if="typeof line === 'string'">{{ line }}</div>
                <div v-else>
                  <span class="link" @click="getMapFile"> {{ line.str }}</span>
                </div>
              </template>
            </div>
            <div><b>extra</b>: {{ item.extra || '--' }}</div>
          </template>
          <template v-else-if="item.type === 'pageOut'"> 使用时间: {{ item.duration }}ms </template>
        </div>
      </a-timeline-item>
      <!--
      <a-timeline-item label="2017-03-10" dotColor="#00B42A"> The first milestone </a-timeline-item>
      <a-timeline-item label="2018-05-22">The second milestone</a-timeline-item>
      <a-timeline-item label="2020-06-22" dotColor="#F53F3F">
        The third milestone
        <IconExclamationCircleFill
          :style="{ color: 'F53F3F', fontSize: '12px', marginLeft: '4px' }"
        />
      </a-timeline-item>
      <a-timeline-item label="2020-09-30" dotColor="#C9CDD4">
        The fourth milestone
      </a-timeline-item> -->
    </a-timeline>
    <!--  -->
    <code-preview-dialog ref="codePreviewDialogRef"></code-preview-dialog>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import CodePreviewDialog from './components/code-preview-dialog.vue';

  const dotColorMap: any = {
    pageIn: '#165dff',
    api: '#4caf50',
    action: '#673ab7',
    apiError: '#f44336',
    error: '#ff5722',
    pageOut: '#165dff',
  };

  const footprint = ref([
    { time: 1743146330458, type: 'pageIn', desc: '进入页面', from: '/page', to: '/mock' },
    {
      time: 1743146330558,
      type: 'api',
      desc: '接口调用',
      api: 'HTTP-GET-/api/newsClient/cn/ClientRightInfoList',
    },
    { time: 1743146332361, type: 'action', desc: '行为', info: '{"a":1,"b":"222"}' },
    {
      time: 1743146334461,
      type: 'apiError',
      desc: '接口报错',
      api: 'HTTP-GET-/api/newsClient/cn/userList',
      error:
        'System.NullReferenceException: Object reference not set to an instance of an object.\n   at extHangfire.OnStateElection(ElectStateContext context) in /data/jenkins2/workspace/UAT_Kayou.Assistant.Provider/Kayou.Assistant.Api.Core/Extensions/extHangfire.cs:line 10\n   at Kayou.Hangfire.HangfireExceptionFilter.OnStateElection(ElectStateContext context)\n   at Hangfire.States.StateMachine.InvokeOnStateElection(Tuple`2 x)\n   at Hangfire.Profiling.ProfilerExtensions.InvokeAction[TInstance](InstanceAction`1 tuple)\n   at Hangfire.Profiling.SlowLogProfiler.InvokeMeasured[TInstance,TResult](TInstance instance, Func`2 action, String message)\n   at Hangfire.Profiling.ProfilerExtensions.InvokeMeasured[TInstance](IProfiler profiler, TInstance instance, Action`1 action, String message)\n   at Hangfire.States.StateMachine.ApplyState(ApplyStateContext initialContext)\n   at Hangfire.States.BackgroundJobStateChanger.ChangeState(StateChangeContext context)\n   at Hangfire.Server.DelayedJobScheduler.EnqueueBackgroundJob(BackgroundProcessContext context, IStorageConnection connection, String jobId)',
      host: '172.17.0.10',
      level: 'Error',
      loggerName: 'Hangfire.Server.DelayedJobScheduler',
      message:
        '5 state change attempt(s) failed due to an exception, moving job to the FailedState',
    },
    { time: 1743146335381, type: 'action', desc: '行为', info: '按钮1' },
    {
      time: 1743146336561,
      type: 'error',
      desc: '前端报错',
      errType: 'reject',
      message: '{}.customFn is not a function',
      stack:
        'TypeError: {}.customFn is not a function\n    at https://fffff.games/tracker/assets/index-b78d3956.js:1:397',
      extra: '',
    },
    { time: 1743146341289, type: 'pageOut', desc: '离开页面', duration: 10831 },
  ]);

  /** 格式化stack */
  const formatStack = (stack: String) => {
    const list = stack.split('\n');
    return list.map((str) => {
      if (/at/g.test(str)) {
        return {
          str: str,
        };
      }
      return str;
    });
  };

  const codePreviewDialogRef = ref();
  const getMapFile = () => {
    codePreviewDialogRef.value.openDialog();
  };
</script>

<style lang="scss" scoped>
  .link {
    color: #2196f3;
    cursor: pointer;
    &:hover {
      color: #00bcd4;
    }
  }
</style>
