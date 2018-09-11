<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
  <script src="https://cdn.jsdelivr.net/npm/axios@0.18.0/dist/axios.js"></script>
  <style>
    *{
    padding:0;margin:0;
  }
  html,body{
    background-color:#fff;
  }
  #container {width:100vw; height: 100vh; }  
   .info {
        border: solid 1px silver;
    }
    div.info-top {
        position: relative;
        background: none repeat scroll 0 0 #F9F9F9;
        border-bottom: 1px solid #CCC;
        border-radius: 5px 5px 0 0;
    }
    div.info-top div {
        display: inline-block;
        color: #333333;
        font-size: 14px;
        font-weight: bold;
        line-height: 31px;
        padding: 0 10px;
    }
    div.info-top img {
        position: absolute;
        top: 10px;
        right: 10px;
        transition-duration: 0.25s;
    }
    div.info-top img:hover {
      cursor:pointer;
        box-shadow: 0px 0px 5px #000;
    }
    div.info-middle {
        font-size: 12px;
        padding: 6px;
        line-height: 20px;
    }
    div.info-bottom {
        height: 0px;
        width: 100%;
        clear: both;
        text-align: center;
    }
    div.info-bottom img {
        position: relative;
        z-index: 104;
    }
    span {
        margin-left: 5px;
        font-size: 11px;
    }
    .info-middle img {
        float: right;
        margin-left: 6px;
            width: 60px;
    }
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
      background:#5dd5c8;
    }
  </style>
</head>

<body>
  <div id="container"></div>
  <script src="https://webapi.amap.com/maps?v=1.4.8&key=561e624287cdebd75ad99d43e00c53ef"></script>
  <script type="text/javascript">
    var map = new AMap.Map('container', {
      // 30.6565202250,104.0655899048
      mapStyle: 'amap://styles/c4df92f5249831f6e56519481f366553',
      center: [104.0655899048, 30.6565202250],
      zoom: 12
    });
    function closeInfoWindow() {
      map.clearInfoWindow();
    }
    async function getList() {
      const res = await axios.get('/list')
      res.data.list.forEach(el => {
        const longitude = parseFloat(el.longitude, 10)
        const latitude = parseFloat(el.latitude, 10)
        if (!isNaN(longitude) && !isNaN(latitude)) {
          const marker = new AMap.Marker({
            position: [longitude, latitude], //位置
            content: `<div class="map-icon ${el.jobFrom}"></div>`
          })
          map.add(marker);
          const element = document.createElement("div");
          element.class= 'info'
          const inner = `<div class="info-top">
              <div>${el.companyShortName}-${el.companyFullName}<br/>${el.positionName}-¥${el.salary_min}~¥${el.salary_max}</div><img src="https://webapi.amap.com/images/close2.gif" onclick="closeInfoWindow()">
            </div>
            <div class="info-middle" style="background-color: white;">
              <img src="${el.companyLogo}">
              位置： ${el.subwayline} - ${el.stationname} - ${el.district}<br/>
              公司人数：${el.companySize}<br/>
              工资构成：${el.companyLabelList?el.companyLabelList.toString():null}<br/>
              学历要求: ${el.education}<br/>
              发布时间: ${el.createTime}<br/>
              公司优势: ${el.positionAdvantage}<br/>
              年资: ${el.workYear}<br/>
              <a href="${el.url}" target="_blank">详细信息-${el.jobFrom}</a>
            </div>`
          element.insertAdjacentHTML('afterbegin',inner)
          const infoWindow = new AMap.InfoWindow({
            isCustom: true, //使用自定义窗体
            content: element,
            offset: new AMap.Pixel(16, -45)
          });
          AMap.event.addListener(marker, 'click', function () {
            infoWindow.open(map, marker.getPosition());
          });
        }
      })
    }
    getList()
  </script>
</body>

</html>