<template> 
  <div class="app-container">
    <el-card class="operate-container" shadow="never" v-for="(cabinet, index) in cabinetArray" :key="cabinet.cabinetName">
      <i class="el-icon-tickets"></i>
      <span class="cabinet-title">{{cabinet.cabinetName}}柜</span>
      <div class="cabinet-container" v-for="(item, index) in cabinet.list" :key="cabinet.cabinetName + index">
        <div class="cabinet-item" v-for="o in item" :key="o.id">
          <div class="handler-mask" :class="{'no-product': !o.product}">
            <div class="cargo-handle-btn" v-if="o.product" @click.stop.prevent="openGoodsShelfForm(o)">更换商品</div>
            <div class="cargo-handle-btn" v-if="!o.product" @click.stop.prevent="openGoodsShelfForm(o)">上架商品</div>
            <div class="cargo-handle-btn" v-if="o.product" @click.stop.prevent="handleOffShelf(o)">下架商品</div>
            <div class="cargo-handle-btn" v-if="o.product" @click.stop.prevent="openStockForm(o)">增加库存</div>
            <div class="cargo-handle-btn" @click.stop.prevent="openCapacityForm(o)">更改容量</div>
          </div>
          <div class="item-wrap">
            <div class="item-header">
              <div class="ivu-tag"><span class="ivu-tag-text">{{o.channelNo}}</span></div>
            </div>
            <div class="item-img">
              <img v-if="o.product" :src="getProductImg(o.product)" border="0" />
              <svg-icon v-else icon-class="tea_drink"></svg-icon>
            </div>
            <div class="item-desc">
              <p class="highlight">{{o.product && o.product.stock || 0}} / {{o.capacity}}</p>
              <p v-if="o.product" :title="o.product.name">{{o.product.name}}</p>
              <p v-else title="无配置商品">无配置商品</p>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    <el-dialog title="更新货道容量" :visible.sync="capacityFormVisible">
      <el-form :model="form">
        <el-form-item label="货道容量：" label-width="120px">
          <el-input v-model="form.capacity" autocomplete="off" class="mini-input"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="capacityFormVisible = false">取 消</el-button>
        <el-button type="primary" @click.stop.prevent="updateCapacity()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="增加库存" :visible.sync="stockFormVisible">
      <el-form :model="form">
        <el-form-item label="库存数：" label-width="120px">
          <el-input v-model="form.stock" autocomplete="off" class="mini-input"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="stockFormVisible = false">取 消</el-button>
        <el-button type="primary" @click.stop.prevent="updateStock()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="商品上架"
      :visible.sync="goodsShelf.dialogVisible"
      width="60%">
      <el-input placeholder="按商品名称搜索" v-model="goodsShelf.productName" size="small" style="width: 50%;margin-left: 20px">
        <el-button slot="append" icon="el-icon-search" @click="handleGoodsSearch"></el-button>
      </el-input>
      <el-table style="width: 100%; margin-top: 15px"
                :data="goodsShelf.goodsList"
                v-loading="listLoading"
                border>
        <el-table-column label="" width="90" align="center">
          <template slot-scope="scope"><input type="radio" name="pid" :value="scope.row.id" v-model="goodsShelf.pid" @click="chooseGoods(scope.row)"></template>
        </el-table-column>
        <el-table-column label="商品图片" width="140" align="center">
          <template slot-scope="scope"><img :src="getPictureUrl(scope.row)" height="45" border="0"></template>
        </el-table-column>
        <el-table-column label="商品名称" align="left">
          <template slot-scope="scope">{{scope.row.name}}</template>
        </el-table-column>
        <el-table-column label="价格" width="120" align="center">
          <template slot-scope="scope">¥{{scope.row.price}}</template>
        </el-table-column>
        <el-table-column label="库存" width="120" align="center">
          <template slot-scope="scope">{{scope.row.stock && scope.row.stock.total || 0}}</template>
        </el-table-column>
        <el-table-column label="上架数量" width="150" align="center">
          <template slot-scope="scope"><el-input v-model="scope.row.weight"></el-input></template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          layout="total, sizes,prev, pager, next,jumper"
          :page-size="goodsShelf.pageSize"
          :page-sizes="[5,10,15]"
          :current-page.sync="goodsShelf.pageIndex - 1"
          :total="goodsShelf.total">
        </el-pagination>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="discardGoodsShelf">取 消</el-button>
        <el-button type="primary" @click="handleGoodsShelfConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import {fetchCargoList, updateChannel, onShelf, offShelf, incrementStock} from '@/api/terminal'
  import {fetchList as fetchGoodsList} from '@/api/product'
  import Constants from '@/api/constants'

  export default {
    name: "cargoList",
    data() {
      return {
        listQuery: {},
        list: null,
        total: null,
        listLoading: false,
        multipleSelection: [],
        cabinetArray: [],
        capacityFormVisible: false,
        stockFormVisible: false,
        form: {
          capacity: 12,
          channelId: 0,
          stock: 0,
          oldStock: 0
        },
        channel: {},
        selectedGoods: {},
        goodsShelf: {
          dialogVisible: false,
          productName: '',
          goodsList: null,
          total: null,
          pageIndex: 1,
          pageSize: 6,
          pid: ''
        }
      }
    },
    created() {
      this.listQuery = {
        deviceId: this.$route.query.id || ''
      };
      this.getList();
    },
    filters: {
    },
    methods: {
      getList() {
        fetchCargoList(this.listQuery).then(response => {
          this.list = response.data;
          this.total = response.data.length;
          this.rebuildCargoList()
        });
      },
      rebuildCargoList() {
        if (!this.list || this.list.length === 0) {
          return;
        }
        var cabinetArray = [];
        var lastLevel = '';
        var lastCabinetName = '';
        var cabinetIndex = 0;
        var levelIndex = 0;
        var changedCarbinet = false;

        this.list.forEach(item => {
          if (lastCabinetName != item.level.charAt(0)) {
            if (lastCabinetName !== '') {
              ++cabinetIndex;
              changedCarbinet = true;
            }
            levelIndex = 0;
            cabinetArray.push({'cabinetName': item.level.charAt(0), 'list': []});
          } else {
            changedCarbinet = false;
          }
          if (lastLevel !== item.level) {
            if (!changedCarbinet && lastLevel !== '') {
              ++levelIndex;
            }
            cabinetArray[cabinetIndex].list.push([item]);
          } else {
            cabinetArray[cabinetIndex].list[levelIndex].push(item);
          }
          lastLevel = item.level;
          lastCabinetName = lastLevel.charAt(0);
        });
        this.cabinetArray = cabinetArray;
      },
      openCapacityForm(item) {
        Object.assign(this.form, item);
        this.capacityFormVisible = true;
        this.channel = item;
      },
      updateCapacity() {
        updateChannel(this.form).then(response => {
          if (response.result === 0) {
            this.$message({
              message: '更新成功',
              type: 'success',
              duration: 1000
            });
            this.capacityFormVisible = false;
            this.channel.capacity = this.form.capacity;
          } else {
            this.$message({
              message: '更新失败',
              type: 'error',
              duration: 1000
            });
          }
        });
      },
      openGoodsShelfForm(item) {
        this.goodsShelf.dialogVisible = true;
        this.channel = item;
        this.getGoodsList();
      },
      getGoodsList() {
        this.listLoading = true;
        fetchGoodsList({
          artworkTypeName: 'tea',
          currentPage: this.goodsShelf.pageIndex || 1,
          pageSize: this.goodsShelf.pageSize,
          name: this.goodsShelf.productName || ''
        }).then(response => {
          this.listLoading = false;
          this.goodsShelf.goodsList = response.artworks;
          this.goodsShelf.total = response.totalRecords;
          this.goodsShelf.pageIndex++;
        }).catch(error => {
          this.listLoading = false;
          console.error(error);
        });
      },
      handleGoodsSearch() {
        this.goodsShelf.pageIndex = 1;
        this.getGoodsList();
      },
      handleSizeChange(val) {
        this.goodsShelf.pageIndex = 1;
        this.goodsShelf.pageSize = val;
        this.getGoodsList();
      },
      handleCurrentChange(val) {
        this.goodsShelf.pageIndex = val;
        this.getGoodsList();
      },
      discardGoodsShelf() {
        this.goodsShelf.dialogVisible = false;
        this.goodsShelf.pageIndex = 1;
        this.selectedGoods = {};
      },
      handleGoodsShelfConfirm() {
        this.goodsShelf.dialogVisible = false;
        if (this.goodsShelf.pid && this.selectedGoods.id) {
          let item = this.selectedGoods;
          onShelf({
            id: this.channel.id,
            product: {
              name: item.name,
              oldPrice: item.markPrice || item.price,
              pid: item.id,
              pno: item.id,
              price: item.price,
              sellPoint: item.sellPoint,
              pictures: item.pictures,
              stock: item.weight || 0,
              salesCount: item.stock && item.stock.salesCount || 0
            }
          }).then(response => {
            if (response.result === 0) {
              this.$message({
                message: '上架成功',
                type: 'success',
                duration: 1000
              });
              this.selectedGoods = {};
              this.goodsShelf.pageIndex = 1;
              this.getList();
            } else {
              this.$message({
                message: '上架失败',
                type: 'error',
                duration: 1000
              });
            }
          }).catch(error => {
            this.$message({
              message: '网络故障，请检查网络！',
              type: 'error',
              duration: 1000
            });
          });
        }
      },
      getPictureUrl(row) {
        if (row.pictures && row.pictures.length) {
          return `${Constants.Config.psServer}${row.pictures[0].id}?w=80`;
        }
        return Constants.Config.defaultAvatar;
      },
      getProductImg(product) {
        if (product.pictures && product.pictures.length) {
          return `${Constants.Config.psServer}/${product.pictures[0].id}?h=100`;
        }
        return Constants.Config.defaultAvatar;
      },
      chooseGoods(item) {
        this.selectedGoods = item;
      },
      handleOffShelf(item) {
        offShelf({
          id: item.id
        }).then(response => {
          if (response.result === 0) {
            this.$message({
              message: '下架成功',
              type: 'success',
              duration: 1000
            });
            this.getList();
          } else {
            this.$message({
              message: '下架失败',
              type: 'error',
              duration: 1000
            });
          }
        })
      },
      openStockForm(o) {
        this.stockFormVisible = true;
        this.form.channelId = o.id;
        this.form.capacity = o.capacity;
        this.form.oldStock = Number(o.product && o.product.stock || 0);
      },
      updateStock() {
        if (this.form.stock == 0) {
          this.$message({
            message: '库存数不能为0',
            type: 'error',
            duration: 1000
          });
          return;
        }
        if (Number(this.form.stock) + this.form.oldStock > this.form.capacity) {
          this.$message({
            message: '库存数超出货道容量，请重新录入',
            type: 'error',
            duration: 1000
          });
          return;
        }
        incrementStock({
          id: this.form.channelId,
          stock: this.form.stock
        }).then(response => {
          if (response.result === 0) {
            this.stockFormVisible = false;
            this.$message({
              message: '增加库存成功',
              type: 'success',
              duration: 1000
            });
            this.getList();
          } else {
            this.$message({
              message: '增加库存失败',
              type: 'error',
              duration: 1000
            });
          }
        })
      }
    }
  }
</script>
<style scoped>
  .cabinet-container {
    flex: 1;
    padding: 10px 0;
    overflow: auto;
    display: flex;
    flex-wrap: wrap;
  }
  .cabinet-item {
    position: relative;
    width: 9%;
    height: auto;
    background: #fff;
    overflow: hidden;
    border-radius: 4px;
    margin: 5px 2px;
    margin-right: 15px;
    text-align: center;
    position: relative;
    border: 1px solid #e7eaec;
  }
  .cabinet-item:hover{
    border: 1px #69ACE0 solid;
    -moz-box-shadow: 1px 1px 10px 2px #69ACE0;
    -webkit-box-shadow: 1px 1px 10px 2px #69ACE0;
    box-shadow: 1px 1px 10px 2px #69ACE0;
  }
  .handler-mask{
    position: absolute;
    height: 100%;
    width: 100%;
    left: 0;
    top: 0;
    background-color: rgba(0,0,0,.3);
    justify-content: center;
    align-items: center;
    transition: .2s;
    z-index: 10;
    opacity: 0;
    padding: 20px 0;
  }
  .cabinet-item:hover .handler-mask{
    opacity: 1;
  }
  .handler-mask .cargo-handle-btn {
    font-size: 12px;
    margin: 8px auto;
    width: fit-content;
    padding: 4px 6px;
    color: #fff;
    background: #f5bc33;
    border-radius: 2px;
    line-height: 14px;
    cursor: pointer;
  }
  .handler-mask.no-product {
    padding: 50px 0 0;
  }
  .item-header {
    height: 30px;
  }
  .ivu-tag {
    display: inline-block;
    height: 22px;
    line-height: 22px;
    margin: 2px 4px 2px 0;
    padding: 0 10px;
    border: 0;
    border-radius: 3px;
    background: rgb(130, 205, 255);
    font-size: 12px;
    vertical-align: middle;
    overflow: hidden;
    color: #fff;
  }
  .item-img {
    position: relative;
    height: 100px;
  }
  .item-img .svg-icon{
    height: 100%;
    font-size: 30px;
    color: #ccc;
    max-width: 100%;
  }
  .item-img img{
    height: 100%;
    max-width: 100%;
    object-fit: contain;
    object-position: center;
  }
  .item-desc {
    overflow: hidden;
    text-align: center;
    font-size: 12px;
    color: #666;
  }
  .item-desc p {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 3px 10% 5px;
    box-sizing: border-box;
    margin: 0;
    text-align: center;
  }
  .item-desc p.highlight {
    font-size: 14px;
    color: #949494;
    padding: 0;
  }
  .mini-input {
    width: 300px;
  }
  .pagination-container{
    margin-top: 10px;
    margin-bottom: 10px;
    display: block;
    width: 100%;
  }
</style>


