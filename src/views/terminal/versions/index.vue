<template> 
  <div class="app-container">
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
      <el-button
        class="btn-add"
        type="primary"
        @click="handleAdd()"
        size="mini">
        添加
      </el-button>
    </el-card>
    <div class="table-container">
      <el-table ref="productTable"
                :data="list"
                style="width: 100%"
                @selection-change="handleSelectionChange"
                v-loading="listLoading"
                border>
        <el-table-column label="版本名" width="100" align="center">
          <template slot-scope="scope">{{scope.row.versionName}}</template>
        </el-table-column>
        <el-table-column label="版本编号" width="100" align="center">
          <template slot-scope="scope">{{scope.row.versionCode}}</template>
        </el-table-column>
        <el-table-column label="更新设备数" width="100" align="center">
          <template slot-scope="scope">{{scope.row.devices && scope.row.devices.length || 0}}</template>
        </el-table-column>
        <el-table-column label="下载地址" align="center">
          <template slot-scope="scope">{{scope.row.url}}</template>
        </el-table-column>
        <el-table-column label="描述" align="center">
          <template slot-scope="scope">{{scope.row.remark }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <p>
              <el-button
                size="mini"
                type="primary"
                @click="handleUpdate(scope.$index, scope.row)">编辑
              </el-button>
              <el-button
                size="mini"
                type="primary"
                @click="openReleaseDialog(scope.$index, scope.row)">推送版本
              </el-button>
            </p>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="batch-operate-container"></div>
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes,prev, pager, next,jumper"
        :page-size="listQuery.pageSize"
        :page-sizes="[10, 20, 100]"
        :current-page.sync="listQuery.pageNumber"
        :total="total">
      </el-pagination>
    </div>

    <el-dialog title="推送版本" :visible.sync="releaseFormVisible">
      <el-form :model="releaseForm" ref="deviceForm" label-width="150px">
        <el-form-item label="推送设备：">
          <el-select v-model="releaseForm.deviceId" placeholder="全部" clearable>
            <el-option
              v-for="item in devicesOptions"
              :key="item.deviceId"
              :label="item.name"
              :value="item.deviceId">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="releaseFormVisible = false">取 消</el-button>
        <el-button type="primary" @click.stop.prevent="handleRelease()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import {fetchList, releaseVersion} from '@/api/versions'
  import {fetchList as fetchDeviceList} from '@/api/terminal'

  const defaultListQuery = {
    pageNumber: 1,
    pageSize: 100
  };
  export default {
    name: "versionList",
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        list: null,
        total: null,
        listLoading: true,
        multipleSelection: [],
        releaseFormVisible: false,
        devicesOptions: [],
        releaseForm: {
          deviceId: '',
          versionCode: ''
        }
      }
    },
    created() {
      this.getList();
      this.getDeviceList();
    },
    filters: {
    },
    methods: {
      getList() {
        this.listLoading = true;
        fetchList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.content;
          this.total = response.data.totalElements;
        });
      },
      handleSearchList() {
        this.listQuery.pageNumber = 1;
        this.getList();
      },
      handleAdd() {
        this.$router.push({name:'addVersion'});
      },
      handleSizeChange(val) {
        this.listQuery.pageNumber = 1;
        this.listQuery.pageSize = val;
        this.getList();
      },
      handleCurrentChange(val) {
        this.listQuery.pageNumber = val;
        this.getList();
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      handleResetSearch() {
        this.selectProductCateValue = [];
        this.listQuery = Object.assign({}, defaultListQuery);
      },
      handleUpdate(index, row) {
        this.$router.push({name:'updateVersion',query:{id: row.id}});
      },
      handleRelease() {
        releaseVersion({
          deviceId: this.releaseForm.deviceId || '',
          versionCode: this.releaseForm.versionCode
        }).then(response => {
          if (response.result == 0) {
            this.$message({
              message: '推送版本成功',
              type: 'success',
              duration: 1000
            });
          this.releaseFormVisible = false;
          } else {
            this.$message({
              message: '推送版本失败',
              type: 'error',
              duration: 1000
            });
          }
        }).catch(error => {
          this.$message({
            message: '网络故障，请稍候再试',
            type: 'error',
            duration: 1000
          });
        });
      },
      openReleaseDialog(index, row) {
        this.releaseFormVisible = true;
        this.releaseForm.versionCode = row.versionCode;
      },
      getDeviceList() {
        fetchDeviceList({
          pageSize: 100
        }).then(response => {
          this.devicesOptions = response.data.list;
        });
      }
    }
  }
</script>
<style></style>


