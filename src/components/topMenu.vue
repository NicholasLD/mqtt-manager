<template>
  <el-menu
      :default-active="activeIndex"
      class="topMenu"
      mode="horizontal"
      @select="handleSelect">

    <el-menu-item index="1">
      <template>
        <el-tooltip class="item" effect="dark" content="版本 v1.0.0" placement="right-end">
          <span style="font-size: 25px">MQTT Manager</span>
        </el-tooltip>
      </template>
    </el-menu-item>
  </el-menu>
</template>

<script>
export default {
  name: "topMenu",
  data() {
    return {
      activeIndex: '1',
      activeIndex2: '1'
    };
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    }
  }
}
</script>

<style scoped>

</style>
