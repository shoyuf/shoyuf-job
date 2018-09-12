<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
  <script src="https://cdn.jsdelivr.net/npm/axios@0.18.0/dist/axios.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue@2.5.17/dist/vue.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/element-ui@2.4.6/lib/index.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/element-ui@2.4.6/lib/theme-chalk/index.css">
  <style>
    [v-clock]{
      display:none;
    }
    *{
      padding:0;margin:0;
    }
    html,body{
      background-color:#fff;
    }
    #container {width:100vw; height: 100vh; }  
    .map-icon{
      width:12px;
      height:12px;
      border:1px solid #666;
      border-radius:100%;
    }
    .map-icon.lagou{
      background:#00b38a;
    }
    .map-icon.zhipin{
      background:#f33333;
    }
    .resource-item{
      max-height: 70vh;
      overflow: auto;
    }
    .float{
      position: fixed;
      z-index: 9;
      top:10px;
      left:10px;
    }
  </style>
</head>

<body>
  <div id="app">
    <div class="float">
      <el-button @click="addAll" size="mini" v-clock>添加所有标记</el-button>
      <el-select v-model="low_salary" placeholder="请选择最低薪资" size="mini">
        <el-option :value="0"></el-option>
        <el-option
          v-for="i in 20"
          :key="i"
          :value="i">
        </el-option>
      </el-select>
      <el-select v-model="workYear" placeholder="请选择年资" size="mini">
        <el-option value="全部"></el-option>
        <el-option value="1-3年"></el-option>
        <el-option value="3-5年"></el-option>
      </el-select>
      <el-button icon="el-icon-search" circle size="mini" @click="filter"></el-button>
    </div>
    <div id="container"></div>
  </div>
  <script src="https://webapi.amap.com/maps?v=1.4.8&key=561e624287cdebd75ad99d43e00c53ef"></script>
  <script type="text/javascript">
    let map
    const app = new Vue({
      el:'#app',
      data(){
        return{
          blackList:JSON.parse(localStorage.getItem('blackList')) || [],
          list: null,
          filterList:[],
          low_salary:0,
          workYear:'全部'
        }
      },
      watch:{
        blackList(val){
          localStorage.setItem('blackList',JSON.stringify(Array.from(new Set(val))))
        }
      },
      methods:{
        addAll(){
          map.clearMap();
          this.addMarks(this.list)
        },
        filter(){
          this.filterList = []
          map.clearMap();
          let cacheArr = []
          this.list.forEach(el=>{
            if(this.workYear === '全部'){
              cacheArr.push(el)
            }else{
              if(el.workYear === this.workYear){
                cacheArr.push(el)
              }
            }
          })
          if(this.low_salary !== 0 ){
            cacheArr.forEach(el=>{
              if(el.salary_max>this.low_salary){
                this.filterList.push(el)
              }
            })
          }else{
            this.filterList = cacheArr
          }
          this.addMarks(this.filterList)
        },
        addMarks(arr){
          this.blackList.forEach(el=>{
            const findRes = arr.findIndex(ol=>{
              return ol.positionId === el
            })
            arr.splice(findRes,1)
          })
          arr.forEach(el => {
            const longitude = parseFloat(el.longitude, 10)
            const latitude = parseFloat(el.latitude, 10)
            if (!isNaN(longitude) && !isNaN(latitude)) {
              const marker = new AMap.Marker({
                map,
                position: [longitude, latitude], //位置
                content: `<div class="map-icon ${el.jobFrom}" title="${el.companyShortName}"></div>`
              })
              AMap.event.addListener(marker, 'click', async () => {
                const resItem = await axios.get('/resources/'+el.positionId)
                const item = resItem.data
                const h = this.$createElement;
                const childNodes = []
                childNodes.push(h('el-button',{
                  props:{size:'mini'},
                  on: {click:()=>{
                    // remove marker
                    map.remove(marker)
                    // add localstorage blacklist
                    this.blackList.push(el.positionId)
                  }},
                },'屏蔽该职位'))
                if(item.companyFullName)childNodes.push(h('p',null,`公司全称：${item.companyFullName}`))
                if(item.positionName)childNodes.push(h('p',null,`职位名称：${item.positionName}`))
                if(item.salary_min&&item.salary_max)childNodes.push(h('p',null,`薪资水平：${item.salary_min}-${item.salary_max}`))
                if(item.companyLabelList)childNodes.push(h('p',null,`公司标签：${item.companyLabelList.toString()}`))
                if(item.companySize)childNodes.push(h('p',null,`公司人数：${item.companySize}`))
                if(item.district)childNodes.push(h('p',null,`公司所在区县：${item.district}`))
                if(item.education)childNodes.push(h('p',null,`学历要求：${item.education}`))
                if(item.createTime)childNodes.push(h('p',null,`发布时间：${item.createTime}`))
                if(item.update_time)childNodes.push(h('p',null,`更新时间：${item.update_time}`))
                if(item.positionAdvantage)childNodes.push(h('p',null,`公司优势：${item.positionAdvantage}`))
                if(item.subwayline)childNodes.push(h('p',null,`地铁线：${item.subwayline}`))
                if(item.stationname)childNodes.push(h('p',null,`地铁站：${item.stationname}`))
                if(item.workYear)childNodes.push(h('p',null,`年资：${item.workYear}`))
                if(item.desc)childNodes.push(h('p',null,`描述：${item.desc}`))
                if(item.address)childNodes.push(h('p',null,`地址：${item.address}`))
                if(item.url)childNodes.push(h('p',null,[
                  h('span',null,'URL: '),
                  h('a',{
                    attrs:{
                      href:item.url,
                      target:'_blank',
                    }
                  },item.jobFrom)
                ]))
                const vnode = h('div',null,childNodes)
                this.$msgbox({
                  title:`${item.companyShortName}`,
                  message:vnode,
                  dangerouslyUseHTMLString:true,
                  showCancelButton: true,
                  showConfirmButton: false,
                  customClass:'resource-item'
                }).then(()=>{
                }).catch(()=>{
                });
              });
            }
          })
        },
        async getList(){
          const res = await axios.get('/resources')
          this.list = res.data.list
        }
      },
      mounted(){
        map = new AMap.Map('container', {
          mapStyle: 'amap://styles/c4df92f5249831f6e56519481f366553',
          center: [104.0655899048, 30.6565202250],
          zoom: 12
        });
        this.getList()
      }
    })
  </script>
</body>

</html>