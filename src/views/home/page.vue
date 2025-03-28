<template>
  <div>
    <a-table :data="tableData">
      <template #columns>
        <a-table-column title="AppId" data-index="appId" align="center" :width="120">
          <template #cell="{ record }"> {{ record.appId }} </template>
        </a-table-column>
        <a-table-column title="页面" :width="220">
          <template #cell="{ record }">
            <div>{{ record.to }}</div>
            <div>来自：{{ record.from }}</div>
          </template>
        </a-table-column>
        <a-table-column title="浏览时间" :width="250">
          <template #cell="{ record }">
            <div>浏览时长: {{ durationFormat(record.duration) }}</div>
            <div>{{ dateRangeFormat(record.start, record.end) }}</div>
          </template>
        </a-table-column>
        <a-table-column title="操作记录">
          <template #cell="{ record }">
            <div v-if="!record.actions.length">--</div>
            <div v-for="(item, i) in record.actions" :key="i">
              {{ new Date(item.time).toLocaleString() }}
              <span> - </span>
              {{ item.info }}
            </div>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { getLogList } from '@/api';

  const tableData = ref([]);

  onMounted(() => {
    init();
  });

  const init = () => {
    getLogList('page').then((res) => {
      tableData.value = [
        ...res.data,
        ...[
          {
            type: 'page',
            appId: 1,
            from: '/',
            to: '/page',
            start: 1743146326608,
            end: 1743146330458,
            duration: 3850,
            actions: [],
          },
          {
            type: 'page',
            appId: 1,
            from: '/page',
            to: '/mock',
            start: 1743146330458,
            end: 1743146341289,
            duration: 10831,
            actions: [
              {
                appId: 1,
                time: 1743146331361,
                info: '按钮1',
              },
              {
                appId: 1,
                time: 1743146332071,
                info: '{"a":1,"b":"222"}',
              },
              {
                appId: 1,
                time: 1743146333807,
                info: '{"a":1,"b":"222"}',
              },
              {
                appId: 1,
                time: 1743146334295,
                info: '按钮1',
              },
            ],
          },
          {
            type: 'page',
            appId: 1,
            from: '/mock',
            to: '/error',
            start: 1743145990273,
            end: 1743146255229,
            duration: 155391,
            actions: [],
          },
          {
            type: 'page',
            appId: 1,
            from: '/error',
            to: '/page',
            start: 1743146255229,
            end: 1743146326435,
            duration: 71206,
            actions: [],
          },
        ],
      ] as any;
    });
  };

  const dateRangeFormat = (start: Date, end: Date) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleString()}~${
      s.toLocaleDateString() === e.toLocaleDateString()
        ? e.toLocaleTimeString()
        : e.toLocaleDateString()
    }`;
  };

  const durationFormat = (t: number) => {
    if (t < 1000) return '<1秒';
    else if (t < 60000) return `${Math.round(t / 1000)}秒`;
    else if (t < 3600000) return `${Math.round(t / 60000)}分`;
    else return `${Math.round(t / 60000)}时`;
  };
</script>
