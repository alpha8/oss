<template>
  <el-card class="form-container" shadow="never">
    <el-form :model="versions"
             :rules="rules"
             ref="versionForm"
             label-width="150px">
      <el-form-item label="版本名：" prop="versionName">
        <el-input v-model="versions.versionName"></el-input>
      </el-form-item>
      <el-form-item label="版本编号：" prop="versionCode">
        <el-input v-model="versions.versionCode"></el-input>
      </el-form-item>
      <el-form-item label="下载地址：" prop="url">
        <el-input v-model="versions.url"></el-input>
      </el-form-item>
      <el-form-item label="描述：">
        <el-input v-model="versions.remark"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit('versionForm')">提交</el-button>
        <el-button @click="goBack">返回</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
  import {updateVersions, getVersions, createVersions} from '@/api/versions';

  const defaultQuery = {
  };
  export default {
    name: "VersionDetail",
    props: {
      isEdit: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        versions: Object.assign({}, defaultQuery),
        rules: {
          versionName: [
            {required: true, message: '请输入版本名', trigger: 'blur'},
            {min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur'}
          ],
          versionCode: [
            {required: true, message: '请输入版本编号', trigger: 'blur'},
            {min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur'}
          ],
          url: [
            {required: true, message: '请输入下载地址', trigger: 'blur'},
            {min: 10, max: 255, message: '长度在 10 到 255 个字符', trigger: 'blur'}
          ]
        }
      }
    },
    created() {
      if (this.isEdit) {
        getVersions(this.$route.query.id).then(response => {
          this.versions = response.data;
        });
      } else {
        this.versions = Object.assign({}, defaultQuery);
      }
    },
    methods: {
      onSubmit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$confirm('是否提交数据', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              if (this.isEdit) {
                this.versions.id = this.$route.query.id;
                updateVersions(this.versions).then(response => {
                  if (response.result == 0) {
                    this.$message({
                      message: '修改成功',
                      type: 'success',
                      duration: 1000
                    });
                    this.$router.back();
                  } else {
                    this.$message({
                      message: '出错了，请检查下数据！',
                      type: 'error',
                      duration: 1000
                    });
                  }
                });
              } else {
                createVersions(this.versions).then(response => {
                  this.$refs[formName].resetFields();
                  this.resetForm(formName);
                  this.$message({
                    message: '提交成功',
                    type: 'success',
                    duration: 1000
                  });
                });
              }
            });

          } else {
            this.$message({
              message: '验证失败',
              type: 'error',
              duration: 1000
            });
            return false;
          }
        });
      },
      goBack() {
        this.$router.back();
      }
    },
    filters: {
    }
  }
</script>

<style scoped>

</style>
