<template>
  <div class="virtualshelf-container">
    <el-form :inline="true" :model="listQuery" size="small" label-width="140px"
         :rules="rules"
         ref="deviceForm">
      <div class="filter-container" style="margin-top: 20px; margin-left: 20px">
        <div>
          <i class="el-icon-tickets"></i>
          <span><b>虚拟货架</b></span>
        </div>
        <div style="margin-top: 15px">
          <el-form-item label="虚拟货架名称：" prop="name">
            <el-input style="width: 203px" v-model="listQuery.name" placeholder="货架名称"></el-input>
          </el-form-item>
          <el-form-item label="关联设备：" prop="deviceId">
            <el-select v-model="listQuery.deviceId" placeholder="">
              <el-option
                v-for="item in deviceOptions"
                :key="item.deviceId"
                :label="item.name"
                :value="item.deviceId">
              </el-option>
            </el-select>
          </el-form-item>
        </div>
      </div>

      <div class="container">
        <div class="shelf-wrap">
          <div class="shelf-container">
            <draggable class="drag-container" v-bind="options" handle=".layer-product-item" group="tea" :list="shelvedList">
                <div class="layer-product-item" v-for="(item, index) in shelvedList" :key="index">
                  <div class="product-image">
                    <img :src="getProductImg(item)" alt="" width="200">
                    <img src="http://www.yihuyixi.com/saleoff.png" width="80" height="80" alt="" border="0" class="saleoff" v-if="item.status === 1">
                    <div class="handler-mask"><div class="cargo-handle-btn" @click="removeProduct(index, item)"><i class="el-icon-delete"></i></div></div>
                  </div>
                  <div class="product-desc">
                    <p>{{item.name}}</p>
                    <p><strong>¥{{item.price}}</strong>&nbsp;&nbsp;<del>¥{{item.oldPrice}}</del></p>
                  </div>
                </div>
            </draggable>
          </div>
        </div>
        <div class="product-shelf">
          <div class="auto-create-switch">
            <div class="title">自动生成虚拟货架</div>
            <el-switch
              v-model="autoGenerateShelf"
              active-text="开"
              inactive-text="关"
              @change="switchGenerate">
            </el-switch>
            <div class="desc">开启后设备会根据货道配置的商品，自动生成虚拟货架</div>
          </div>
          <div class="product-container">
            <header>
              <el-input placeholder="按商品名称搜索" v-model="form.productName" size="small">
                <el-button slot="append" icon="el-icon-search" @click.stop.prevent="handleGoodsSearch"></el-button>
              </el-input>
            </header>
            <main>
              <draggable class="drag-container" :clone="clone" :list="filterGoodsList" v-bind="options" handle=".el-card" @start="start" :group="{ name: 'tea', pull: pullFunction }">
                <el-card :body-style="{ padding: '15px 15px 10px 15px' }" v-for="(item, index) in filterGoodsList" :key="index">
                  <div class="product-item">
                    <div class="product-image">
                      <img :src="getProductImg(item)" alt="" width="200">
                    </div>
                  </div>
                  <div class="product-desc">
                    <p>{{item.name}}</p>
                  </div>
                </el-card>
              </draggable>
            </main>
          </div>
        </div>
      </div>
      <div class="footer-container">
        <el-button @click="goBack">返 回</el-button>
        <el-button type="primary" @click="saveVirtualShelf('deviceForm')" :loading="loading">保 存</el-button>
      </div>
    </el-form>
  </div>
</template>
<script>
  import {fetchShelfGoodsList} from '@/api/product'
  import {fetchList as fetchDeviceList} from '@/api/terminal'
  import {batchInsert, fetchList} from '@/api/virtualshelf'
  import Constants from '@/api/constants'
  import draggable from 'vuedraggable'

  export default {
    name: "virtualShelfDetail",
    data() {
      return {
        listQuery: {},
        autoGenerateShelf: false,
        form: {
          productName: ''
        },
        listLoading: true,
        shelvedList: [],
        goodsList: [],
        filterGoodsList: [],
        controlOnStart: true,
        deviceOptions: [],
        rules: {
          name: [
            {required: true, message: '请输入虚拟货架名称', trigger: 'blur'},
            {min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur'}
          ],
          deviceId: [
            {required: true, message: '请输入的关联设备', trigger: 'blur'}
          ]
        },
        loading: false,
        options: {animation: 60}
      }
    },
    created() {
      this.getCurrentDevice();
      this.getDeviceList();
      this.getList(false);
    },
    filters: {
    },
    methods: {
      getList(isShelved) {
        fetchShelfGoodsList({
          shelved: isShelved
        }).then(response => {
          if (response.result === 0) {
            let list = response.data && response.data.content;
            if (list && list.length) {
              var uniqueGoodsList = [];
              list.forEach(item => {
                if (item.product && !uniqueGoodsList.filter(o => o.pid == item.product.pid).length) {
                  uniqueGoodsList.push(item.product);
                  this.filterGoodsList.push(item.product);
                }
              });
              this.goodsList = uniqueGoodsList;
            }
          }
        });
      },
      getDeviceList() {
        fetchDeviceList({
          pageSize: 100
        }).then(response => {
          this.deviceOptions = response.data.list;
        });
      },
      getCurrentDevice() {
        this.listLoading = true;
        let deviceId = this.$route.query.deviceId;
        if (deviceId) {
          fetchList({
            deviceId: deviceId
          }).then(response => {
            this.listLoading = false;
            if (response.result === 0) {
              if (response.data.products) {
                Object.assign(this.listQuery, response.data);
                this.shelvedList = response.data.products;
              } else {
                this.listQuery.deviceId = deviceId;
              }
            }
          }).catch(error => {
            this.listLoading = false;
          });
        }
      },
      handleGoodsSearch() {
        this.filterGoodsList = this.goodsList.filter(o => o.name.indexOf(this.form.productName) != -1);
      },
      getProductImg(product) {
        if (product.pictures && product.pictures.length) {
          return `${Constants.Config.psServer}${product.pictures[0].id}?w=500`;
        }
        return Constants.Config.defaultAvatar;
      },
      clone(goods) {
        return goods;
      },
      pullFunction() {
        return this.controlOnStart ? "clone" : true;
      },
      start({ originalEvent }) {
        this.controlOnStart = originalEvent.ctrlKey;
      },
      goBack() {
        this.$router.back();
      },
      removeProduct(index, item) {
        var found = false;
        for (var i=0; i<this.filterGoodsList.length; i++){
          if (this.filterGoodsList[i].pid == item.pid) {
            found = true;
            break;
          }
        }
        if (!found) {
          let o = Object.assign({}, item);
          this.filterGoodsList.unshift(o);
        }
        this.shelvedList.splice(index, 1);
      },
      saveVirtualShelf(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if (!this.shelvedList.length) {
              this.$message({
                message: '虚拟货架未关联产品',
                type: 'error',
                duration: 1000
              });
              return;
            }
            this.$confirm('是否提交数据', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.loading = true;
              var products = [];
              var index = this.shelvedList.length + 1  * 20;
              this.shelvedList.forEach(item => {
                item.sort = index--;
                products.push(item);
              });
              batchInsert({
                deviceId: this.listQuery.deviceId,
                name: this.listQuery.name,
                products: products
              }).then(response => {
                if (response.result === 0) {
                  this.$message({
                    message: '保存虚拟货架成功',
                    type: 'success',
                    duration: 1000
                  });
                  this.loading = false;
                  this.$router.back();
                } else {
                  this.$message({
                    message: '保存虚拟货架成功失败',
                    type: 'error',
                    duration: 1000
                  });
                  this.loading = false;
                }
              })
            }).catch(error => {
              this.loading = false;
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
      switchGenerate() {
        if (this.autoGenerateShelf) {
          this.$nextTick(() => {
            Object.assign(this.shelvedList, this.goodsList);
            this.filterGoodsList = [];
          });
        } else {
          this.$nextTick(() => {
            Object.assign(this.filterGoodsList, this.goodsList);
            this.shelvedList = [];
          });
        }
      }
    },
    components: {draggable}
  }
</script>
<style scoped>
.container {
  width: 100%;
  display: flex;
  padding: 20px;
  box-sizing: border-box;
}
.shelf-wrap {
  display: flex;
  flex-flow: column nowrap;
  width: 80%;
  height: 650px;
  overflow: hidden;
}
.shelf-container{
  border: 1px solid #d1d1d1;
  border-radius: 3px;
  position: relative;
  height: 100%;
  padding: 20px 0 20px 30px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
}
.shelf-container .drag-container{
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  box-sizing: border-box;
}
.shelf-container .layer-product-item{
  position: relative;
  width: 20%;
  border: 1px solid #e7eaec;
  box-sizing: border-box;
  border-radius: 5px;
  overflow: hidden;
  margin-right: 40px;
  margin-bottom: 20px;
}
.shelf-container .layer-product-item:nth-child(4) {
  margin-right: 0;
}
.shelf-container .layer-product-item:hover {
  border: 1px #69ACE0 solid;
  -webkit-box-shadow: 1px 1px 10px 2px #69ACE0;
  box-shadow: 1px 1px 10px 2px #69ACE0;
}
.shelf-container .product-image {
  position: relative;
  text-align: center;
  display: flex;
  align-items: flex-end;
  transition: .3s;
  overflow: hidden;
  object-fit: contain;
  object-position: center;
}
.shelf-container .product-image:hover .handler-mask{
  opacity: 1;
}
.shelf-container .product-image .handler-mask {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 100;
  background: rgba(0, 0, 0, .4);
  display: flex;
  text-align: center;
  align-items: center;
  align-content: center;
  opacity: 0;
  transition: 0.3s;
}
.shelf-container .handler-mask .cargo-handle-btn{
  width: 100%;
  color: #e5b661;
}
.shelf-container .handler-mask .cargo-handle-btn > i {
  cursor: pointer;
  font-size: 26px;
}
.shelf-container .product-image>img {
  max-width: 100%;
  max-height: 100%;
  display: block;
}
.shelf-container .product-image .saleoff {
  position: absolute;
  right: 0px;
  top: 0px;
}
.shelf-container .product-desc{
  width: 100%;
  position: relative;
  cursor: pointer;
  box-sizing: border-box;
  font-size: 13px;
  color: #666;
  padding: 5px;
  background: #f5f5f5;
}
.shelf-container .product-desc p {
  height: 20px;
  line-height: 20px;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-shelf{
  width: calc(20% - 16px);
  margin-left: 16px;
  height: 650px;
}
.auto-create-switch{
  padding: 20px;
  background-color: #fffcf5;
  border-radius: 4px;
  border: 1px solid #ffc629;
}
.auto-create-switch .title{
  font-size: 14px;
  color: #444;
  font-weight: 700;
}
.auto-create-switch .desc{
  color: #747373;
  font-size: 12px;
}
.auto-create-switch .el-switch {
  margin: 15px 0;
}
.product-container{
  margin-top: 15px;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #d1d1d1;
  height: 500px;
}
.product-container header {
  background: #e7e7e7;
  padding: 15px;
}
.product-container main{
  flex: 1;
  padding: 10px 15px;
  overflow: auto;
}
.product-container .el-card{
  position: relative;
  margin-bottom: 15px;
}
.product-item {
  width: 100%;
  box-sizing: border-box;
}
.product-item .product-image {
  position: relative;
  text-align: center;
  display: flex;
  align-items: flex-end;
  transition: .3s;
  overflow: hidden;
  object-fit: contain;
  object-position: center;
}
.product-item .product-image img {
  display: block;
  max-width: 100%;
  max-height: 100%;
}
.product-container .product-desc{
  margin-bottom: 5px;
  padding: 0 5px;
}
.product-container .product-desc p{
  margin: 0;
  height: 20px;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}
.footer-container{
  clear:both;
  width: 100%;
  display: block;
  text-align: center;
  padding-bottom: 20px;
}
</style>


