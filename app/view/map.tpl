<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
  <script src="https://cdn.jsdelivr.net/npm/axios@0.18.0/dist/axios.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue@2.5.17/dist/vue.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/element-ui@2.4.6/lib/index.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/element-ui@2.4.6/lib/theme-chalk/index.css">
  <style>
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
  </style>
</head>

<body>
  <div id="app">
    <div id="container"></div>
  </div>
  <script src="https://webapi.amap.com/maps?v=1.4.8&key=561e624287cdebd75ad99d43e00c53ef"></script>
  <script type="text/javascript">
    let map
    const app = new Vue({
      el:'#app',
      methods:{
        async getList(){
          const res = await axios.get('/resources')
          res.data.list.forEach(el => {

            const longitude = parseFloat(el.longitude, 10)
            const latitude = parseFloat(el.latitude, 10)

            if (!isNaN(longitude) && !isNaN(latitude)) {
              const marker = new AMap.Marker({
                position: [longitude, latitude], //位置
                content: `<div class="map-icon ${el.jobFrom}"></div>`
              })
              map.add(marker);
              AMap.event.addListener(marker, 'click', async () => {
                const resItem = await axios.get('/resources/'+el.positionId)
                const item = resItem.data
                let message = ''
                if(item.companyFullName)message+=`<p>公司全称：${item.companyFullName}</p>`
                if(item.positionName)message+=`<p>职位名称：${item.positionName}</p>`
                if(item.salary_min&&item.salary_max)message+=`<p>薪资水平：${item.salary_min}-${item.salary_max}</p>`
                if(item.positionName)message+=`<p>职位名称：${item.positionName}</p>`
                if(item.companyLabelList)message+=`<p>公司标签：${item.companyLabelList.toString()}</p>`
                if(item.companySize)message+=`<p>公司人数：${item.companySize}</p>`
                if(item.district)message+=`<p>公司所在区县：${item.district}</p>`
                if(item.education)message+=`<p>学历要求：${item.education}</p>`
                if(item.createTime)message+=`<p>发布时间：${item.createTime}</p>`
                if(item.update_time)message+=`<p>更新时间：${item.update_time}</p>`
                if(item.positionAdvantage)message+=`<p>公司优势：${item.positionAdvantage}</p>`
                if(item.subwayline)message+=`<p>地铁线：${item.subwayline}</p>`
                if(item.stationname)message+=`<p>地铁站：${item.stationname}</p>`
                if(item.workYear)message+=`<p>年资：${item.workYear}</p>`
                if(item.desc)message+=`<p>描述：${item.desc}</p>`
                if(item.address)message+=`<p>地址：${item.address}</p>`
                if(item.url)message+=`<p>URL：<a href="${item.url}" target="_blank">${item.jobFrom}</a></p>`
                this.$msgbox({
                  title:`${item.companyShortName}`,
                  message,
                  dangerouslyUseHTMLString:true,
                  showCancelButton: true,
                  showConfirmButton: false,
                  customClass:'resource-item'
                }).then(res=>{
                  console.log(res)
                }).catch(res=>{
                  console.log(res)
                });
              });
            }
          })
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