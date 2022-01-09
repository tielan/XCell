<template>
  <div class="home">
    <div class="top">
      <el-upload
        class="upload-demo"
        :drag="true"
        action="#"
        :http-request="dragSubmit"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
    </div>
    <div class="table">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="date" label="日期" width="180">
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="180">
        </el-table-column>
        <el-table-column prop="address" label="地址"> </el-table-column>
      </el-table>
    </div>
    <div class="footer">
      <el-pagination layout="prev, pager, next" :total="50"> </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      tableData: [],
    };
  },
  methods: {
    dragSubmit(event) {
      var reader = new FileReader();
      reader.readAsArrayBuffer(event.file);
      reader.onload = function(){
        console.log(this.result); //打印：已经成功读取文件
      };
    },
  },
};
</script>
<style lang="scss">
.home {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  .top {
    text-align: center;
  }
  .table {
    padding: 12px;
    flex: 1;
  }
  .footer {
    text-align: center;
    height: 50px;
  }
}
</style>
