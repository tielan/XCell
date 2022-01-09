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
      <div class="option">
        <el-button-group>
          <el-button type="primary" @click="downloadXlsx" :loading="xLoading"
            >下载表格</el-button
          >
          <el-button type="primary" @click="downloadDoc" :loading="dLoading"
            >下载文档</el-button
          >
        </el-button-group>
      </div>
    </div>
    <div class="table">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="XZQMC" label="XZQMC"></el-table-column>
        <el-table-column prop="DLMC" label="DLMC"></el-table-column>
        <el-table-column prop="DKJSMJ" label="DKJSMJ"></el-table-column>
        <el-table-column prop="Name" label="Name"> </el-table-column>
        <el-table-column prop="DKJSMJ" label="DKJSMJ"></el-table-column>
        <el-table-column prop="JMMJ" label="JMMJ"> </el-table-column>
        <el-table-column prop="TBBH" label="TBBH"> </el-table-column>
        <el-table-column prop="X" label="X"> </el-table-column>
        <el-table-column prop="XZQDM" label="XZQDM"> </el-table-column>
        <el-table-column prop="Y" label="Y"> </el-table-column>
        <el-table-column prop="ZJRXM" label="ZJRXM"> </el-table-column>
        <el-table-column prop="ZLDWMC" label="ZLDWMC"> </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      tableData: [],
      xLoading: false,
      dLoading: false,
    };
  },
  methods: {
    dragSubmit(event) {
      var reader = new FileReader();
      reader.readAsArrayBuffer(event.file);
      reader.onload = () => {
        if (window.CNative) {
          window.CNative.uploadFile({ byteArray: reader.result }).then(
            (result) => {
              this.tableData = result;
              console.log(result); //打印：已经成功读取文件
            }
          );
        }
      };
    },
    downloadXlsx() {
      if (window.CNative) {
        this.xLoading = true;
        window.CNative.downloadXlsx(this.tableData )
          .catch((e) => {
            console.log(e);
          })
          .finally(() => {
            this.xLoading = false;
          });
      }
    },
    downloadDoc() {
      if (window.CNative) {
        this.dLoading = true;
        window.CNative.downloadDoc(this.tableData)
          .catch((e) => {
            console.log(e);
          })
          .finally(() => {
            this.dLoading = false;
          });
      }
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
    padding: 0 12px;
    display: flex;
    justify-content: space-between;
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
