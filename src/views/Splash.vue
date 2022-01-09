<template>
  <div
    class="splash"
  >
    <div class="splashContent">
      <div class="splashLogo">
      </div>
      <div class="splashMain">
        <div class="splashType1">
          <span id="info">正在连接服务器...</span>
        </div>
        <div class="splashType2">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Splase",
  data() {
    return {
      url: "",
    };
  },
  methods: {
   
  },
};
</script>

<style lang="scss">
.splash {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-size: 100% 100%;

  .splashContent {
    position: absolute;
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
  }

  .splashType1 {
    margin-top: 80px;
  }

  .splashType1 img {
    display: block;
    margin: 0 auto;
  }

  .splashType1 span {
    display: block;
    text-align: center;
    color: rgba(62, 116, 232, 1);
    font-size: 30px;
    font-weight: bold;
    margin-top: -35px;
  }

  .splashType2 {
    text-align: center;
    display: none;
    margin-top: 137px;
  }

  .splashType2 span {
    display: block;
    color: rgba(62, 116, 232, 1);
    font-size: 30px;
    font-weight: bold;
  }

  .splashType2 font {
    display: block;
    width: 280px;
    height: 80px;
    text-align: center;
    line-height: 80px;
    color: #fff;
    font-size: 36px;
    margin: 30px auto 0;
    cursor: pointer;
  }

  .splashMain2 .splashType2 {
    display: block;
  }

  .splashMain2 .splashType1 {
    display: none;
  }
}
</style>