<template>
  <div class="home">
    <a-table>
      <template #columns>
        <a-table-column title="aaa" data-index="hrSystemJobNumber" align="center" :width="120">
          <template #cell="{ record }"> 111 </template>
        </a-table-column>
        <a-table-column title="bbb" data-index="hrSystemJobNumber" align="center" :width="120">
          <template #cell="{ record }"> 222 </template>
        </a-table-column>
      </template>
    </a-table>
  </div>
</template>

<script lang="js" setup>
  import { onMounted, ref } from 'vue';
  import { getLogList } from '@/api';

  const tableData = ref([]);

  onMounted(() => {
    init()
  });

  const init = () => {
    getLogList().then((res) => {
      tableData.value = res;
    });
  };
</script>

<style lang="scss" scoped>
  .home {
    padding: 0 12px;
    font-size: 14px;
  }
</style>
