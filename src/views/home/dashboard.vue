<template>
  <div class="app-container">
    <div class="shelf-wrap">
      <el-card class="box-card" v-for="item in virtualShelfs" :key="item.id">
        <div slot="header" class="clearfix">
          <span><b>{{item.name}}</b></span>
          <div style="float: right; width: 120px;text-align: right; font-size: 12px;" v-if="item.stats" :title="getStockRateDesc(item)">
            <el-progress :percentage="item.stats.stockRate"></el-progress>
          </div>
        </div>
        <div class="item">
          <el-row :gutter="20">
            <el-col :span="12"><el-button @click="openChannelList(item)">货道数 {{item.stats && item.stats.total || 0}}</el-button></el-col>
            <el-col :span="12"><el-button @click="openChannelList(item)">空货道 {{item.stats && item.stats.empty || 0}}</el-button></el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12"><el-button @click="openChannelList(item)">上架数 {{item.stats && item.stats.hasGoodsCount || 0}}</el-button></el-col>
            <el-col :span="12"><el-button @click="openChannelList(item)">断货 {{item.stats && item.stats.shortGoodsCount || 0}}</el-button></el-col></el-col>
          </el-row>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
  import {fetchList} from '@/api/terminal';
  import {fetchShelfGoodsList} from '@/api/product';
  import Vue from 'vue';

  export default {
    name: "dashboard",
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
          this.virtualShelfs.map(o => {
            this.getChannelsByDevice(o);
          });
        });
      },
      getChannelsByDevice(item) {
        fetchShelfGoodsList({
          deviceId: item.deviceId
        }).then(response => {
          var channels = response.data.content;
          var total = 0;
          var empty = 0;
          var shortGoodsCount = 0;
          var hasGoodsCount = 0;
          var hasGoodsTotal = 0;
          if (channels && channels.length) {
            channels.forEach(o => {
              total += o.capacity;
              if (o.product && o.product.pid) {
                hasGoodsCount++;
                if (o.product.stock) {
                  hasGoodsTotal += o.product.stock;
                } else {
                  shortGoodsCount++;
                }
              } else {
                empty++;
              }
            });
            Vue.set(item, 'stats', {
              total: total,
              empty: empty,
              shortGoodsCount: shortGoodsCount,
              hasGoodsCount: hasGoodsCount,
              hasGoodsTotal: hasGoodsTotal,
              stockRate: Number(hasGoodsTotal / total).toFixed(1) * 100 / 100
            });
          }
        });
      },
      getStockRateDesc(item) {
        if (!item.stats) {
          return '库存率：0%';
        }
        return `库存率：${item.stats.stockRate}%`;
      },
      updateConfig(item) {
        this.$router.push({name: 'virtualShelfDetail', query: {deviceId: item.deviceId}});
      },
      addVirtualShelf() {
        this.$router.push({name: 'addVirtualShelf'});
      },
      openChannelList(item) {
        this.$router.push({name: 'cargo', query: {deviceId: item.deviceId}})
      },
      goBack() {
        this.$router.back();
      }
    }
  }
</script>

<style scoped>
  .el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .shelf-wrap {
    margin-top: 20px;
    position: relative;
    display: flex;
    width: 100%;
  }
  .shelf-wrap .el-card {
    position: relative;
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
