<template>
  <div class="setting">
    <el-form
      label-position="left"
      label-width="90px"
      :model="form"
      :rules="formRules"
      ref="ruleForm"
    >
      <div style="height:15px"></div>
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
      <div style="height:1px"></div>
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
import cloneDeep from "lodash/cloneDeep";
import * as Validate from "@/utils/Validate";
export default {
  name: "Home",
  data() {
    return {
      formRules: {
        deviceType: [{ required: true, message: "设备类型不能为空" }],
        host: [
          { required: true, message: "服务器地址不能为空" },
          { validator: Validate.isValidIp, message: "ip格式非法" },
        ],
        port: [
          { required: true, message: "http端口不能为空" },
          { type: "number", message: "端口必须为数字值" },
        ],
        ports: [{ type: "number", message: "端口必须为数字值" }],
        localPort: [{ type: "number", message: "端口必须为数字值" }],
      },
      form: {
        devices: [
          {
            name: "一体机",
            type: "0",
            code: "autoterminal",
            page: "/autoterminal/index.html?t=${time}#/",
            extPage: "/autoterminal/index.html?t=${time}#/se",
          },
          {
            name: "排队机",
            type: "1",
            code: "offernumber",
            page: "/offernumber/index.html?t=${time}#/",
          },
        ],
        pjClientNum: null,
        deviceType: "",
        host: null,
        port: null,
        ports: null,
        localPort: null,
      },
      oldSeting: {},
    };
  },
  created() {
    console.log("init");
    if (window.CNative && window.CNative.onDomReady) {
      window.CNative.onDomReady((event, setting) => {
        let _setting = cloneDeep(setting);
        this.oldSeting = cloneDeep(setting);
        this.form = { ...this.form, ..._setting };
      });
    }
  },
  methods: {
    onSubmit(exit) {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          if (window.CNative && window.CNative.saveSetting) {
            if (
              this.oldSeting["deviceType"] != this.form["deviceType"] ||
              this.oldSeting["host"] != this.form["host"] ||
              this.oldSeting["port"] != this.form["port"]
            ) {
              this.form["clientNum"] = 0;
            }
            window.CNative.saveSetting(this.form);
            if (exit) {
              window.CNative.appRelaunch();
            }
          }
        } else {
          return false;
        }
      });
    },
  },
};
</script>
<style lang="scss">
.setting {
  padding: 0 15px;
}
</style>
