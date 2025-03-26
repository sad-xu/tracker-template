<template>
  <div style="background-color: #f2f3f5">
    <a-menu mode="horizontal" :default-selected-keys="['1']">
      <a-menu-item key="0" :style="{ padding: 0, marginRight: '38px' }" disabled>
        <div style="font-size: 20px; font-weight: bold">日志</div>
      </a-menu-item>
      <router-link class="nav" :to="{ name: 'home' }">
        <a-menu-item key="1">日志首页</a-menu-item>
      </router-link>
      <router-link class="nav" :to="{ name: 'manage' }">
        <a-menu-item key="2">模拟</a-menu-item>
      </router-link>
    </a-menu>
  </div>
  <div style="padding: 12px">
    <router-view />
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped></style>
