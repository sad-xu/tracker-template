<template>
  <div>
    <div class="name">
      test
      <div class="child"></div>
    </div>
  </div>
</template>

<script setup>
  const a = 1;

  // a += 2;
</script>

<style lang="scss" scoped>
  .name {
    color: #fff;
    font-size: 12px;
    background-color: #f00;

    .child {
      font-size: 14px;
    }
  }

  .child {
    font-size: 12px;
  }
</style>
