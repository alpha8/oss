<template> 
  <div class="detail-container">
    <div>
      <el-steps :active="formatStepStatus(order.status)" finish-status="success" align-center>
        <el-step title="提交订单" :description="formatTime(order.createAt)"></el-step>
        <el-step title="支付订单" :description="formatTime(order.createAt)"></el-step>
        <el-step title="退款时间" :description="formatTime(order.refund.finishStage.createTime)" v-if="order.refund && order.refund.finishStage"></el-step>
        <el-step title="已完成" :description="formatTime(order.receiverAt)" v-else></el-step>
      </el-steps>
    </div>
    <el-card shadow="never" style="margin-top: 15px">
      <div class="operate-container">
        <i class="el-icon-warning color-danger" style="margin-left: 20px"></i>
        <span class="color-danger">当前订单状态：{{order.status | formatStatus}}</span>
        <!-- <div class="operate-button-container">
          <el-button size="mini" @click="showMarkOrderDialog">备注订单</el-button>
        </div> -->
      </div>
      <div style="margin-top: 20px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">基本信息</span>
      </div>
      <div class="table-layout">
        <el-row>
          <el-col :span="6" class="table-cell-title">订单编号</el-col>
          <el-col :span="6" class="table-cell-title">用户账号</el-col>
          <el-col :span="6" class="table-cell-title">订单类型</el-col>
          <el-col :span="6" class="table-cell-title">订单来源</el-col>
        </el-row>
        <el-row>
          <el-col :span="6" class="table-cell">{{order.orderNo}}</el-col>
          <el-col :span="6" class="table-cell">{{order.express && order.express.receiver || '匿名'}}</el-col>
          <el-col :span="6" class="table-cell">{{order.type | formatOrderType}}</el-col>
          <el-col :span="6" class="table-cell">{{order.vendor && order.vendor.vendorId || '在线商城'}}</el-col>
        </el-row>
      </div>
      <div style="margin-top: 20px" v-if="order.user">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">用户行为分析</span>
      </div>
      <div class="table-layout" v-if="order.user">
        <el-row>
          <el-col :span="6" class="table-cell-title">用户</el-col>
          <el-col :span="6" class="table-cell-title">关注公众号</el-col>
          <el-col :span="6" class="table-cell-title">首次访问</el-col>
          <el-col :span="6" class="table-cell-title">总购买额</el-col>
        </el-row>
        <el-row>
          <el-col :span="6" class="table-cell"><img :src="order.user.icon" border="0" width="32" height="32" style="border-radius: 50%; margin-bottom: 8px;vertical-align: middle ">{{order.express && order.express.receiver || '匿名'}}</el-col>
          <el-col :span="6" class="table-cell">{{order.user.follow == 1 ? '已关注' : order.user.follow == 0 ? '未关注' : '取消关注'}}</el-col>
          <el-col :span="6" class="table-cell">{{formatTime(order.user.firstView) }}</el-col>
          <el-col :span="6" class="table-cell">￥{{order.user.totalFee}}</el-col>
        </el-row>
      </div>
      <div style="margin-top: 20px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">商品信息</span>
      </div>
      <el-table
        ref="orderItemTable"
        :data="order.products"
        style="width: 100%;margin-top: 20px" border>
        <el-table-column label="商品图片" width="150" align="center">
          <template slot-scope="scope">
            <img :src="getProductImg(scope.row.icon)" style="height: 80px">
          </template>
        </el-table-column>
        <el-table-column label="商品名称" align="center">
          <template slot-scope="scope">
            <p>{{scope.row.name}}</p>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="120" align="center">
          <template slot-scope="scope">￥{{scope.row.price}}</template>
        </el-table-column>
        <el-table-column label="数量" width="120" align="center">
          <template slot-scope="scope">
            {{scope.row.count}}x
          </template>
        </el-table-column>
        <el-table-column label="小计" width="120" align="center">
          <template slot-scope="scope">
            ￥{{scope.row.price*scope.row.count}}
          </template>
        </el-table-column>
      </el-table>
      <div style="float: right;margin: 20px">
        合计：<span class="color-danger">￥{{order.totalFee}}</span>
      </div>
      <div style="margin-top: 60px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">费用信息</span>
      </div>
      <div class="table-layout">
        <el-row>
          <el-col :span="6" class="table-cell-title">应付金额</el-col>
          <el-col :span="6" class="table-cell-title">优惠券</el-col>
          <el-col :span="6" class="table-cell-title">折扣券</el-col>
          <el-col :span="6" class="table-cell-title">实付金额</el-col>
        </el-row>
        <el-row>
          <el-col :span="6" class="table-cell">￥{{order.originalFee}}</el-col>
          <el-col :span="6" class="table-cell">-￥{{order.couponFee}}</el-col>
          <el-col :span="6" class="table-cell">-￥{{order.discount}}</el-col>
          <el-col :span="6" class="table-cell">￥{{order.totalFee}}</el-col>
        </el-row>
      </div>
    </el-card>
    <el-dialog title="关闭订单"
               :visible.sync="closeDialogVisible"
               width="40%">
      <el-form :model="closeInfo"
               label-width="150px">
        <el-form-item label="操作备注：">
          <el-input v-model="closeInfo.note" type="textarea" rows="3">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCloseOrder">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="备注订单"
               :visible.sync="markOrderDialogVisible"
               width="40%">
      <el-form :model="markInfo"
               label-width="150px">
        <el-form-item label="操作备注：">
          <el-input v-model="markInfo.note" type="textarea" rows="3">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="markOrderDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleMarkOrder">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import {getOrderDetail, closeOrder} from '@/api/order';
  import {formatDate} from '@/utils/date';
  import VDistpicker from 'v-distpicker';
  import Constants from '@/api/constants'
  const defaultReceiverInfo = {
  };
  export default {
    name: 'orderDetail',
    components: { VDistpicker},
    data() {
      return {
        id: null,
        order: {},
        closeDialogVisible:false,
        closeInfo:{note:null,id:null},
        markOrderDialogVisible:false,
        markInfo:{note:null}
      }
    },
    created() {
      this.id = this.list = this.$route.query.id;
      getOrderDetail(this.id).then(response => {
        this.order = response;
      });
    },
    filters: {
      formatNull(value) {
        if(value===undefined||value===null||value===''){
          return '暂无';
        }else{
          return value;
        }
      },
      formatLongText(value) {
        if(value===undefined||value===null||value===''){
          return '暂无';
        }else if(value.length>8){
          return value.substr(0, 8) + '...';
        }else{
          return value;
        }
      },
      formatOrderType(value) {
        if (value === 100) {
          return '售货机订单';
        } else {
          return '正常订单';
        }
      },
      formatStatus(value) {
        if (value === 1) {
          return '待收货';
        } else if (value === 2) {
          return '已发货';
        } else if (value === 3) {
          return '已完成';
        } else if (value === 4) {
          return '已关闭';
        } else if (value === 0) {
          return '待付款';
        } else if (value === 7) {
          return '已退款';
        } else {
          return '无效订单';
        }
      },
      formatPayStatus(value) {
        if (value === 0) {
          return '未支付';
        } else if(value===4){
          return '已退款';
        }else{
          return '已支付';
        }
      },
      formatDeliverStatus(value) {
        if (value === 0||value === 1) {
          return '未发货';
        } else {
          return '已发货';
        }
      }
    },
    methods: {
      getProductImg(icon) {
        if (icon) {
          return `${Constants.Config.psServer}${icon}?w=200`;
        }
        return Constants.Config.defaultAvatar;
      },
      formatTime(time) {
        if (time == null || time === '') {
          return '';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      },
      formatStepStatus(value) {
        if (value === 0) {
          return 1;
        } else if (value === 1) {
          //待发货
          return 2;
        } else if (value === 2) {
          //已发货
          return 3;
        } else if (value === 3) {
          //已完成
          return 4;
        }else {
          //已关闭、无限订单
          return 5;
        }
      },
      showCloseOrderDialog(){
        this.closeDialogVisible=true;
        this.closeInfo.note=null;
        this.closeInfo.id=this.id;
      },
      handleCloseOrder(){
        this.$confirm('是否要关闭?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
            let params = new URLSearchParams();
            params.append("ids",[this.closeInfo.id]);
            params.append("note",this.closeInfo.note);
            closeOrder(params).then(response=>{
              this.closeDialogVisible=false;
              this.$message({
                type: 'success',
                message: '订单关闭成功!'
              });
              getOrderDetail(this.id).then(response => {
                this.order = response.data;
              });
            });
        });
      },
      showMarkOrderDialog(){
        this.markOrderDialogVisible=true;
        this.markInfo.id=this.id;
      },
      handleMarkOrder(){
        this.$confirm('是否要备注订单?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let params = new URLSearchParams();
          params.append("id",this.markInfo.id);
          params.append("note",this.markInfo.note);
          params.append("status",this.order.status);
          updateOrderNote(params).then(response=>{
            this.markOrderDialogVisible=false;
            this.$message({
              type: 'success',
              message: '订单备注成功!'
            });
            getOrderDetail(this.id).then(response => {
              this.order = response.data;
            });
          });
        });
      }
    }
  }
</script>
<style scoped>
  .detail-container {
    width: 80%;
    padding: 20px 20px 20px 20px;
    margin: 20px auto;
  }

  .operate-container {
    background: #F2F6FC;
    height: 80px;
    margin: -20px -20px 0;
    line-height: 80px;
  }

  .operate-button-container {
    float: right;
    margin-right: 20px
  }

  .table-layout {
    margin-top: 20px;
    border-left: 1px solid #DCDFE6;
    border-top: 1px solid #DCDFE6;
  }

  .table-cell {
    height: 60px;
    line-height: 40px;
    border-right: 1px solid #DCDFE6;
    border-bottom: 1px solid #DCDFE6;
    padding: 10px;
    font-size: 14px;
    color: #606266;
    text-align: center;
    overflow: hidden;
  }

  .table-cell-title {
    border-right: 1px solid #DCDFE6;
    border-bottom: 1px solid #DCDFE6;
    padding: 10px;
    background: #F2F6FC;
    text-align: center;
    font-size: 14px;
    color: #303133;
  }
</style>


