<template> 
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button
          style="float: right"
          @click="handleSearchList()"
          type="primary"
          size="small">
          查询结果
        </el-button>
        <el-button
          style="float: right;margin-right: 15px"
          @click="handleResetSearch()"
          size="small">
          重置
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="设备名称：">
            <el-input style="width: 203px" v-model="listQuery.name" placeholder="设备名称"></el-input>
          </el-form-item>
          <el-form-item label="设备状态：">
            <el-select v-model="listQuery.status" placeholder="全部" clearable>
              <el-option
                v-for="item in deviceStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
      <el-button
        class="btn-add"
        type="primary"
        @click="handleAddDevice()"
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
        <el-table-column label="编号" width="100" align="center">
          <template slot-scope="scope">{{scope.row.id}}</template>
        </el-table-column>
        <el-table-column label="设备名称" width="280" align="center">
          <template slot-scope="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="设备编号" width="140" align="center">
          <template slot-scope="scope">{{scope.row.deviceId}}</template>
        </el-table-column>
        <el-table-column label="型号" width="100" align="center">
          <template slot-scope="scope">{{scope.row.type}}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="scope">{{scope.row.deviceStatus | verifyStatusFilter}}</template>
        </el-table-column>
        <el-table-column label="地址" align="left">
          <template slot-scope="scope">{{scope.row.address}}</template>
        </el-table-column>
        <el-table-column label="客服电话" width="120" align="center">
          <template slot-scope="scope">{{scope.row.serviceNo}}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <p>
              <el-button
                size="mini"
                type="primary"
                @click="handleUpdateDevice(scope.$index, scope.row)">编辑
              </el-button>
              <el-button
                size="mini"
                type="primary"
                @click="handleViewCargo(scope.$index, scope.row)">查看货道
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
        :page-sizes="[5,10,15]"
        :current-page.sync="listQuery.pageNum"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>
<script>
  import {fetchList} from '@/api/terminal'

  const defaultListQuery = {
    pageNum: 1,
    pageSize: 5
  };
  export default {
    name: "terminalList",
    data() {
      return {
        listQuery: Object.assign({}, defaultListQuery),
        list: null,
        total: null,
        listLoading: true,
        multipleSelection: [],
        deviceStatusOptions: [{
          value: 1,
          label: '离线'
        }, {
          value: 0,
          label: '在线'
        }]
      }
    },
    created() {
      this.getList();
    },
    filters: {
      verifyStatusFilter(value) {
        if (value === 0) {
          return '在线';
        } else {
          return '离线';
        }
      }
    },
    methods: {
      getList() {
        this.listLoading = true;
        fetchList(this.listQuery).then(response => {
          this.listLoading = false;
          this.list = response.data.list;
          this.total = response.data.total;
        });
      },
      handleSearchList() {
        this.listQuery.pageNum = 1;
        this.getList();
      },
      handleAddDevice() {
        this.$router.push({path:'/terminal/addDevice'});
      },
      handleSizeChange(val) {
        this.listQuery.pageNum = 1;
        this.listQuery.pageSize = val;
        this.getList();
      },
      handleCurrentChange(val) {
        this.listQuery.pageNum = val;
        this.getList();
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      handleResetSearch() {
        this.selectProductCateValue = [];
        this.listQuery = Object.assign({}, defaultListQuery);
      },
      handleUpdateDevice(index,row){
        this.$router.push({path:'/terminal/updateDevice',query:{id:row.id}});
      },
      handleViewCargo(index, row) {
        this.$router.push({path:'/terminal/cargo',query:{id: row.deviceId}});
      }
    }
  }
</script>
<style></style>


