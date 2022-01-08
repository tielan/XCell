<template>
  <div class="about">
    <span>gov_hall_app v{{ version }}</span>
  </div>
</template>
<script>
export default {
  name: "Splase",
  data() {
    return {
      version: "1.0.0",
    };
  },
  mounted() {
    this.version = window.CNative.getPackageJson().version
  },
};
</script>

<style lang="scss">
.about {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
