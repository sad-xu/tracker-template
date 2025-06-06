<template>
  <div style="background-color: #f2f3f5">
    <a-menu mode="horizontal" :default-selected-keys="['1']">
      <a-menu-item key="0" :style="{ padding: 0, marginRight: '38px' }" disabled>
        <div style="font-size: 20px; font-weight: bold">日志</div>
      </a-menu-item>
      <router-link :to="{ name: 'home' }">
        <a-menu-item key="1">日志首页</a-menu-item>
      </router-link>
      <router-link :to="{ name: 'performance' }">
        <a-menu-item key="2">性能数据</a-menu-item>
      </router-link>
      <router-link :to="{ name: 'page' }">
        <a-menu-item key="3">页面数据</a-menu-item>
      </router-link>
      <router-link :to="{ name: 'error' }">
        <a-menu-item key="4">报错数据</a-menu-item>
      </router-link>
      <router-link :to="{ name: 'mock' }">
        <a-menu-item key="5">模拟</a-menu-item>
      </router-link>
      <router-link :to="{ name: 'footprint' }">
        <a-menu-item key="6">足迹</a-menu-item>
      </router-link>
    </a-menu>
  </div>
  <div style="padding: 12px">
    <router-view />
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped></style>
