<template>
  <div class="app-container">
    <el-card shadow="never">
      <div>
        <i class="el-icon-tickets"></i>
        <span><b>虚拟货架</b></span>
        <div class="shelf-wrap">
          <el-card class="box-card grey-bg" shadow="hover" :body-style="{'display': 'flex', 'align-items': 'center', 'align-content': 'center', 'height': '268px', 'line-height': '268px'}">
            <div class="desc" @click="addVirtualShelf">
              <i class="el-icon-plus"></i> 新增虚拟货架
            </div>
          </el-card>
          <el-card class="box-card" v-for="item in virtualShelfs" :key="item.id">
            <div slot="header" class="clearfix">
              <span><b>{{item.name}}</b></span>
<!--               <el-button style="float: right;" type="text" title="删除" @click="removeShelf(item)"><i class="el-icon-delete"></i></el-button>
 -->            </div>
            <div class="item">
              <p>部署地址： {{item.address}}</p>
              <p>创建时间：{{item.createAt | formatTime}}</p>
            </div>
            <div class="card-footer">
              <el-button type="primary" class="button" round @click="updateConfig(item)">更新配置</el-button>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
  import {fetchList} from '@/api/terminal';

  export default {
    name: "virtualShelfList",
    data() {
      return {
        virtualShelfs: []
      };
    },
    created() {
      this.getList();
    },
    filters: {
      formatTime(date) {
        let time = new Date(Date.parse(date));
        time.setTime(time.setHours(time.getHours() + 8));
        let Y = time.getFullYear();
        let M = time.getMonth() + 1;
        let D = time.getDate();
        let h = time.getHours();
        let m = time.getMinutes();
        let s = time.getSeconds();
        return `${Y}-${M}-${D} ${h}:${m}:${s}`;
      }
    },
    methods: {
      getList() {
        fetchList().then(response => {
          this.virtualShelfs = response.data.list;
        });
      },
      updateConfig(item) {
        this.$router.push({name: 'virtualShelfDetail', query: {deviceId: item.deviceId}});
      },
      addVirtualShelf() {
        this.$router.push({name: 'addVirtualShelf'});
      },
      goBack() {
        this.$router.back();
      }
    }
  }
</script>

<style scoped>
  .shelf-wrap {
    margin-top: 20px;
  }
  .shelf-wrap .el-card {
    position: relative;
    height: 275px;
    width: 30%;
    float: left;
    margin-right: 15px;
    margin-bottom: 15px;
    box-sizing: border-box;
  }
  .shelf-wrap .item p{
    font-size: 14px;
    line-height: 20px;
    height: 20px;
    color: #666;
  }
  .shelf-wrap .card-footer{
    clear: both;
    display: flex;
    justify-content: space-around;
    position: absolute;
    bottom: 25px;
    box-sizing: border-box;
  }
  .grey-bg{
    background: #f2f2f2;
  }
  .shelf-wrap .desc {
    width: 100%;
    text-align: center;
    font-size: 14px;
    color: #666;
  }
</style>
