<template>
  <div class="app-container">
    <div class="total-layout">
      <section><div class="section-title">经营情况</div></section>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="total-frame">
            <img :src="img_home_order" class="total-icon">
            <div class="total-title">今日订单总数</div>
            <div class="total-value">200</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="total-frame">
            <img :src="img_home_today_amount" class="total-icon">
            <div class="total-title">今日销售总额</div>
            <div class="total-value">￥5000.00</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="total-frame">
            <img :src="img_home_yesterday_amount" class="total-icon">
            <div class="total-title">昨日销售总额</div>
            <div class="total-value">￥5000.00</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <section><div class="section-title">订单统计</div></section>
    <div class="statistics-layout">
      <el-row>
        <el-col :span="24">
          <div style="padding: 10px;border-left:1px solid #DCDFE6">
            <el-date-picker
              style="float: right;z-index: 1"
              size="small"
              v-model="orderCountDate"
              type="daterange"
              align="right"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="handleDateChange"
              :picker-options="pickerOptions">
            </el-date-picker>
            <div>
              <ve-line
                :data="chartData"
                :legend-visible="false"
                :loading="loading"
                :data-empty="dataEmpty"
                :settings="chartSettings"></ve-line>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <section><div class="section-title">产品销量排行</div></section>
    <div class="section-wrap">
      <el-table ref="productTable"
                :data="[]"
                style="width: 100%"
                border>
        <el-table-column label="排名" width="150" align="center">
          <template slot-scope="scope">{{scope.row.rank}}</template>
        </el-table-column>
        <el-table-column label="商品"  align="center">
          <template slot-scope="scope">{{scope.row.productName}}</template>
        </el-table-column>
        <el-table-column label="销量" width="180" align="center">
          <template slot-scope="scope">{{scope.row.orderCount}}</template>
        </el-table-column>
        <el-table-column label="毛利" width="180" align="center">
          <template slot-scope="scope">￥{{scope.row.gross}}</template>
        </el-table-column>
      </el-table>
    </div>

    <section><div class="section-title">设备分析</div></section>
    <div class="section-wrap">
      <el-table ref="deviceTable"
                :data="[]"
                style="width: 100%"
                border>
        <el-table-column label="设备名称" align="center">
          <template slot-scope="scope"><p style="text-align:left">{{scope.row.rank}}</p></template>
        </el-table-column>
        <el-table-column label="今日交易额 / 毛利 / 订单量" align="center">
          <template slot-scope="scope">{{scope.row.productName}}</template>
        </el-table-column>
        <el-table-column label="昨日交易额 / 毛利 / 订单量"  align="center">
          <template slot-scope="scope">{{scope.row.orderCount}}</template>
        </el-table-column>
        <el-table-column label="本月交易额 / 毛利 / 订单量" align="center">
          <template slot-scope="scope">￥{{scope.row.gross}}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
  import {str2Date} from '@/utils/date';
  import img_home_order from '@/assets/images/home_order.png';
  import img_home_today_amount from '@/assets/images/home_today_amount.png';
  import img_home_yesterday_amount from '@/assets/images/home_yesterday_amount.png';
  const DATA_FROM_BACKEND = {
    columns: ['date', 'orderCount','orderAmount'],
    rows: [
      {date: '2019-06-01', orderCount: 10, orderAmount: 1093},
      {date: '2019-06-02', orderCount: 20, orderAmount: 2230},
      {date: '2019-06-03', orderCount: 33, orderAmount: 3623},
      {date: '2019-06-04', orderCount: 50, orderAmount: 6423},
      {date: '2019-06-05', orderCount: 80, orderAmount: 8492},
      {date: '2019-06-06', orderCount: 60, orderAmount: 6293},
      {date: '2019-06-07', orderCount: 20, orderAmount: 2293},
      {date: '2019-06-08', orderCount: 60, orderAmount: 6293},
      {date: '2019-06-09', orderCount: 50, orderAmount: 5293},
      {date: '2019-06-10', orderCount: 30, orderAmount: 3293},
      {date: '2019-06-06', orderCount: 20, orderAmount: 2293},
      {date: '2019-06-12', orderCount: 80, orderAmount: 8293},
      {date: '2019-06-13', orderCount: 100, orderAmount: 10293},
      {date: '2019-06-14', orderCount: 10, orderAmount: 1293},
      {date: '2019-06-15', orderCount: 40, orderAmount: 4293}
    ]
  };
  export default {
    name: 'home',
    data() {
      return {
        pickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              let start = new Date();
              start.setFullYear(2019);
              start.setMonth(5);
              start.setDate(1);
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一月',
            onClick(picker) {
              const end = new Date();
              let start = new Date();
              start.setFullYear(2019);
              start.setMonth(5);
              start.setDate(1);
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        orderCountDate: '',
        chartSettings: {
          xAxisType: 'time',
          area:true,
          axisSite: { right: ['orderAmount']},
        labelMap: {'orderCount': '订单数量', 'orderAmount': '订单金额'}},
        chartData: {
          columns: [],
          rows: []
        },
        loading: false,
        dataEmpty: false,
        img_home_order,
        img_home_today_amount,
        img_home_yesterday_amount
      }
    },
    created(){
      this.initOrderCountDate();
      this.getData();
    },
    methods:{
      handleDateChange(){
        this.getData();
      },
      initOrderCountDate(){
        let start = new Date();
        start.setFullYear(2019);
        start.setMonth(5);
        start.setDate(1);
        const end = new Date();
        end.setTime(start.getTime() + 1000 * 60 * 60 * 24 * 7);
        this.orderCountDate=[start,end];
      },
      getData(){
        setTimeout(() => {
          this.chartData = {
            columns: ['date', 'orderCount','orderAmount'],
            rows: []
          };
          for(let i=0;i<DATA_FROM_BACKEND.rows.length;i++){
            let item=DATA_FROM_BACKEND.rows[i];
            let currDate=str2Date(item.date);
            let start=this.orderCountDate[0];
            let end=this.orderCountDate[1];
            if(currDate.getTime()>=start.getTime()&&currDate.getTime()<=end.getTime()){
              this.chartData.rows.push(item);
            }
          }
          this.dataEmpty = false;
          this.loading = false
        }, 1000)
      }
    }
  }
</script>

<style scoped>
  .app-container {
    margin-left: 20px;
    margin-right: 20px;
    padding: 10px;
    box-sizing: border-box;
    overflow-x: hidden;
  }
  section {
    display: flex;
    vertical-align: bottom;
    margin-top: 25px;
    margin-bottom: 18px;
  }
  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: #1f273b;
    line-height: 1;
    border-left: 3px solid #1f273b;
    padding: 0 6px;
  }

  .address-layout {
  }

  .total-layout {
    margin-top: 20px;
  }

  .total-frame {
    border: 1px solid #DCDFE6;
    padding: 20px;
    height: 100px;
  }

  .total-icon {
    color: #409EFF;
    width: 60px;
    height: 60px;
  }

  .total-title {
    position: relative;
    font-size: 16px;
    color: #909399;
    left: 70px;
    top: -50px;
  }

  .total-value {
    position: relative;
    font-size: 18px;
    color: #606266;
    left: 70px;
    top: -40px;
  }

  .un-handle-layout {
    margin-top: 20px;
    border: 1px solid #DCDFE6;
  }

  .layout-title {
    color: #606266;
    padding: 15px 20px;
    background: #F2F6FC;
    font-weight: bold;
  }

  .un-handle-content {
    padding: 20px 40px;
  }

  .un-handle-item {
    border-bottom: 1px solid #EBEEF5;
    padding: 10px;
  }

  .overview-layout {
    margin-top: 20px;
  }

  .overview-item-value {
    font-size: 24px;
    text-align: center;
  }

  .overview-item-title {
    margin-top: 10px;
    text-align: center;
  }

  .out-border {
    border: 1px solid #DCDFE6;
  }

  .statistics-layout {
    margin-top: 20px;
    border: 1px solid #DCDFE6;
  }
  .mine-layout {
    position: absolute;
    right: 140px;
    top: 107px;
    width: 250px;
    height: 235px;
  }
  .address-content{
    padding: 20px;
    font-size: 18px
  }
</style>
