<template>
  <div class="setting">
    <el-form
      label-position="left"
      label-width="90px"
      :model="form"
      :rules="formRules"
      ref="ruleForm"
    >
      <div style="height: 15px"></div>
      <el-form-item label="设备类型" prop="deviceType">
        <el-select
          placeholder="请选择设备类型"
          size="medium"
          v-model="form.deviceType"
        >
          <el-option
            v-for="(d, index) in form.devices"
            :key="index"
            :label="d.name"
            :value="d.type"
          ></el-option>
        </el-select>
      </el-form-item>
      <div style="height: 1px"></div>
      <el-divider content-position="center">服务器配置</el-divider>
      <el-form-item label="服务器IP" prop="host">
        <el-input v-model="form.host" placeholder="172.16.17.96"></el-input>
      </el-form-item>
      <el-form-item label="端口(http)" prop="port">
        <el-input v-model.number="form.port" placeholder="6001"></el-input>
      </el-form-item>
      <el-form-item label="端口(https)" prop="ports">
        <el-input v-model.number="form.ports" placeholder="6002"></el-input>
      </el-form-item>
      <el-divider content-position="center">评价器配置</el-divider>
      <el-form-item label="设备编号" prop="pjClientNum">
        <el-input v-model="form.pjClientNum" placeholder="1000"></el-input>
      </el-form-item>
      <el-form-item label="本地端口" prop="localPort">
        <el-input v-model.number="form.localPort" placeholder="1000"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit(0)">保存</el-button>
        <el-button @click="onSubmit(1)">保存并重启</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: "Setting",
  data() {
    return {};
  },
  created() {
    console.log("init");
  },
  methods: {},
};
</script>
<style lang="scss">
.setting {
  padding: 0 15px;
}
</style>
