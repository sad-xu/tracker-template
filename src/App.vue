<template>
  <div>
    <div class="nav-wrapper">
      <router-link class="nav" :to="{ name: 'home' }"> 日志首页 </router-link>
      <router-link class="nav" :to="{ name: 'manage' }"> 错误模拟 </router-link>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
  .nav-wrapper {
    margin-bottom: 24px;
    background-color: #626262;
    padding: 12px;
    box-shadow: 0 0 10px 5px #4f4f4f;
    .nav {
      font-size: 20px;
      font-weight: bold;
      color: #fff;
      padding: 0 8px;
      &:hover {
        text-decoration: underline;
      }
    }
  }
</style>
