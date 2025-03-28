<template>
  <div>
    <a-table :data="tableData">
      <template #columns>
        <a-table-column title="AppId" data-index="appId" align="center" :width="120">
          <template #cell="{ record }"> {{ record.appId }} </template>
        </a-table-column>
        <a-table-column title="设备信息">
          <template #cell="{ record }">
            <div>
              {{ record.userAgent }}
            </div>
            <div>页面尺寸：{{ record.width }}-{{ record.height }}</div>
            <div>设备像素比：{{ record.pixelRatio }}</div>
          </template>
        </a-table-column>
        <a-table-column title="性能信息" :width="160">
          <template #cell="{ record }">
            <div>LCP: {{ record.lcp }}ms</div>
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
  import { getLogList } from '@/api';
  import { dateFormat } from '@/utils';

  const tableData = ref([]);

  onMounted(() => {
    init();
  });

  const init = () => {
    getLogList('performance').then((res) => {
      tableData.value = [
        ...res.data,
        ...[
          {
            type: 'performance',
            lcp: 256,
            appId: 1,
            time: 1743140213042,
            userAgent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
            pixelRatio: 1,
            width: 1097,
            height: 911,
          },
          {
            type: 'performance',
            lcp: 188,
            appId: 1,
            time: 1743140213008,
            userAgent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
            pixelRatio: 1,
            width: 1097,
            height: 911,
          },
          {
            type: 'performance',
            lcp: 138,
            appId: 1,
            time: 1743140210892,
            userAgent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
            pixelRatio: 1,
            width: 1097,
            height: 911,
          },
          {
            type: 'performance',
            lcp: 252,
            appId: 1,
            time: 1743140157342,
            userAgent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
            pixelRatio: 1,
            width: 1097,
            height: 911,
          },
          {
            type: 'performance',
            lcp: 184,
            appId: 1,
            time: 1743140157296,
            userAgent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
            pixelRatio: 1,
            width: 1097,
            height: 911,
          },
        ],
      ] as any;
    });
  };
</script>
