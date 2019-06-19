<template>
  <el-card class="form-container" shadow="never">
    <el-form :model="terminal"
             :rules="rules"
             ref="deviceForm"
             label-width="150px">
      <el-form-item label="设备名称：" prop="name">
        <el-input v-model="terminal.name"></el-input>
      </el-form-item>
      <el-form-item label="设备编号：" prop="deviceId">
        <el-input v-model="terminal.deviceId"></el-input>
      </el-form-item>
      <el-form-item label="设备型号：">
        <el-input v-model="terminal.type"></el-input>
      </el-form-item>
      <el-form-item label="状态：">
        <el-select v-model="terminal.deviceStatus">
          <el-option
            v-for="item in deviceStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="部署地址：" prop="address">
        <el-input v-model="terminal.address"></el-input>
      </el-form-item>
      <el-form-item label="管理密码：" prop="managerPwd">
        <el-input v-model="terminal.managerPwd"></el-input>
      </el-form-item>
      <el-form-item label="客服电话：" prop="serviceNo">
        <el-input v-model="terminal.serviceNo"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit('deviceForm')">提交</el-button>
        <el-button v-if="!isEdit" @click="resetForm('deviceForm')">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
  import {updateTerminal, getTerminal, createTerminal} from '@/api/terminal';

  const defaultTerminal = {
    deviceId: '',
    address: '',
    name: '',
    deviceStatus: 0,
    serviceNo: '',
    managerPwd: '888888'
  };
  export default {
    name: "DeviceDetail",
    props: {
      isEdit: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        terminal: Object.assign({}, defaultTerminal),
        deviceStatusOptions: [{
          value: 0,
          label: '在线'
        }, {
          value: 1,
          label: '离线'
        }],
        rules: {
          name: [
            {required: true, message: '请输入设备名称', trigger: 'blur'},
            {min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur'}
          ],
          address: [
            {required: true, message: '请输入部署地址', trigger: 'blur'},
            {min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur'}
          ],
          managerPwd: [
            {required: true, message: '请输入设备管理密码', trigger: 'blur'},
            {min: 6, max: 8, message: '长度在 6 到 8 个字符', trigger: 'blur'}
          ],
          serviceNo: [
            {required: true, message: '请输入的客户电话', trigger: 'blur'},
            {min: 8, max: 20, message: '请录入有效的客户号码', trigger: 'blur'}
          ],
          deviceId: [
            {required: true, message: '请输入的设备编号', trigger: 'blur'},
            {min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur'}
          ]
        }
      }
    },
    created() {
      if (this.isEdit) {
        getTerminal(this.$route.query.id).then(response => {
          this.terminal = response.data;
        });
      } else {
        this.terminal = Object.assign({}, defaultTerminal);
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
                this.terminal.id = this.$route.query.id;
                updateTerminal(this.terminal).then(response => {
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
                createTerminal(this.terminal).then(response => {
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
      resetForm(formName) {
        this.$refs[formName].resetFields();
        this.terminal = Object.assign({}, defaultTerminal);
      }
    },
    filters: {
    }
  }
</script>

<style scoped>

</style>
