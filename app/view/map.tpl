<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Map</title>
  <script src="https://cdn.jsdelivr.net/npm/axios@0.18.0/dist/axios.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/ant-design-vue@1.3.7/dist/antd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/nprogress@0.2.0/nprogress.min.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nprogress@0.2.0/nprogress.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ant-design-vue@1.3.7/dist/antd.min.css">
  <style>
    [v-cloak] {
        display: none;
      }
      * {
        padding: 0;
        margin: 0;
      }
      body,
      html {
        background-color: #fff;
        position: relative;
      }
      #container {
        width: 100vw;
        height: 100vh;
        position: absolute;
        left: 0;
        right: 0;
      }
      .map-icon{
        position:relative;
      }
      .map-icon:hover::after {
        content: attr(data-name);
        position: absolute;
        color: gray;
        font-size: 12px;
        display: block;
        white-space: nowrap;
        left: 20px;
        top: 8px;
      }
      .map-icon.lagou,
      .map-icon.zhipin {
        width: 12px;
        height: 12px;
        border: 1px solid #666a;
        border-radius: 100%;
      }
      .map-icon.lagou {
        background: #00b38a66;
      }
      .map-icon.zhipin {
        background: #f3333366;
      }
      .map-icon.favorited {
        width: 24px;
        height: 24px;
        border: none;
        background: url("data:image/svg+xml,%3Csvg class='icon' viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cdefs%3E%3Cstyle/%3E%3C/defs%3E%3Cpath d='M626.8 373.3L512 140.6 397.2 373.3c-5.2 10.6-15.4 18-27.1 19.7l-256.7 37.3 185.8 181.1c8.5 8.3 12.4 20.2 10.4 31.9L265.7 899l229.6-120.7c5.2-2.8 11-4.1 16.8-4.1 5.8 0 11.5 1.4 16.8 4.1L758.5 899l-43.9-255.7c-2-11.7 1.9-23.6 10.4-31.9l185.8-181.1L653.9 393c-11.7-1.7-21.8-9.1-27.1-19.7z' fill='%23FFEB3B'/%3E%3Cpath d='M1022.2 394c-4.2-13-15.5-22.5-29.1-24.5L683 324.4l-138.7-281c-6.1-12.3-18.6-20.1-32.3-20.1s-26.2 7.8-32.3 20.1L341 324.4 30.8 369.5C17.3 371.5 6 381 1.8 394c-4.2 13-.7 27.3 9.1 36.9l224.4 218.8-53 308.9c-2.3 13.5 3.2 27.2 14.3 35.2 11.1 8.1 25.8 9.1 37.9 2.7L512 850.7l277.4 145.9c5.3 2.8 11 4.1 16.7 4.1 7.5 0 14.9-2.3 21.2-6.9 11.1-8.1 16.6-21.7 14.3-35.2l-53-308.9L1013 430.9c9.9-9.6 13.5-23.9 9.2-36.9zM724.9 611.3c-8.5 8.3-12.4 20.2-10.4 31.9l43.9 255.7-229.6-120.7c-5.2-2.8-11-4.1-16.8-4.1-5.8 0-11.5 1.4-16.8 4.1L265.6 898.9l43.9-255.7c2-11.7-1.9-23.6-10.4-31.9l-185.7-181L370.1 393c11.7-1.7 21.9-9.1 27.1-19.7L512 140.6l114.8 232.6c5.2 10.6 15.4 18 27.1 19.7l256.7 37.3-185.7 181.1z' fill='%23FF9800'/%3E%3C/svg%3E") no-repeat;
        transform: translate(-7px,-8px);
      }
      .resource-item {
        max-height: 70vh;
        overflow: auto;
      }
      .fixed-top {
        position: fixed;
        z-index: 9;
        padding: 10px 15px;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fffc;
        border: #b2b2b2;
      }
      .flex {
        display: flex;
        align-items: center;
      }
      .flex.space-between {
        justify-content: space-between;
      }
      label.bold{
        font-weight:bold;
        color:#333;
      }
      .job-desc p{
        margin-bottom:0;
      }
    </style>
</head>

<body>
  <div id="container"></div>
  <div id="app">
    {% raw %}
    <div class="fixed-top" v-cloak>
      <div class="left">
        <span>
          <a-tag :color="randomColor">
            Jobs {{markersNum}} ⭐{{ favoriteList.length }} ❗{{blockedList.length}}
          </a-tag>
        </span>
        <a-popconfirm title="您确认要清空屏蔽记录？该操作无法恢复" @confirm="emptyBlockedList" ok-text="Yes" cancel-text="No">
          <a-button size="small" v-cloak type="danger">清空屏蔽记录</a-button>
        </a-popconfirm>
        <a-button size="small" @click="addAllMarkers" type="primary" v-cloak>添加所有标记</a-button>
        <a-select v-model="low_salary" placeholder="最低薪资" size="small" style="width: 120px;">
          <a-select-option :key="0">0</a-select-option>
          <a-select-option v-for="i in 20" :key="i">
            {{i}}
          </a-select-option>
        </a-select>
        <a-select v-model="jobExperience" placeholder="工作经验" size="small" style="width: 120px;">
          <a-select-option key="全部">全部</a-select-option>
          <a-select-option v-for="n in jobExperienceList" :key="n">
            {{n}}
          </a-select-option>
        </a-select>
        <a-button icon="search" type="primary" shape="circle" size="small" @click="filter"></a-button>
      </div>
      <div class="right">
        <a-switch @change='toggleHomeMarker' size="small" />
      </div>
    </div>

    <a-drawer :title="jobDetail.companyFullName" placement="right" :visible="drawerVisible" :mask-style="{
            backgroundColor:'#fffc',
          }"
      @close="drawerVisible = false" width="400" v-cloak>
      <p class="flex space-between">
        <a-button type="primary" @click="toggleFavoriteJob" size="small">{{jobDetail.favorited ? '取消收藏':'收藏'}}职位</a-button>
        <a-button type="danger" @click="blockJob" size="small">{{jobDetail.blocked ? '取消屏蔽':'屏蔽'}}职位</a-button>
      </p>
      <p>
        <label for="" class="bold">
          {{jobDetail.jobFrom==='zhipin'?'Boss直聘':'拉勾'}}ID:
        </label>
        <a v-if="jobDetail.jobFrom==='zhipin'" target="_blank" :href="`https://www.zhipin.com/job_detail/${jobDetail.jobId}.html`">{{jobDetail.jobId}}</a>
        <a v-else target="_blank" :href="`https://www.lagou.com/jobs/${jobDetail.jobId}.html`">{{jobDetail.jobId}}</a>
      </p>
      <p>
        {{jobDetail.companyShortName}} - {{jobDetail.jobName}} - 状态：{{jobDetail.remoteStatus}}
        <a :href="`https://www.tianyancha.com/search?key=${jobDetail.companyFullName}`" target="_blank">天眼查</a>
      </p>
      <p>
        <label for="" class="bold">
          所属区县：
        </label>
        {{jobDetail.districtName}}</p>
      <p>
        <label for="" class="bold">
          工作经验：
        </label>
        {{jobDetail.jobExperience}}</p>
      <p>
        <label for="" class="bold">
          学历要求：
        </label>
        {{jobDetail.degreeName}}</p>
      <p>
        <label for="" class="bold">
          薪资描述：
        </label>
        {{jobDetail.salaryDesc}}</p>
      <p>
        <label for="" class="bold">
          岗位描述：
        </label>
        <p style="white-space: pre-wrap;" class="job-desc" v-html="jobDetail.jobDesc"></p>
      </p>
      <p>
        <label for="" class="bold">
          团队描述：
        </label>{{jobDetail.teamDesc || '-'}}</p>
      <p>
        <label for="" class="bold">
          工作技能：
        </label>
        <a-tag :color="randomColor" v-for="n in jobDetail.requiredSkills" :key="n">{{n}}</a-tag>
      </p>
      <p>
        <label for="" class="bold">
          工作地址：
        </label>{{jobDetail.address}}</p>
      <p>
        <label for="" class="bold">
          融资规模：
        </label>{{jobDetail.comStageName || '-'}}</p>
      <p>
        <label for="" class="bold">
          公司规模：
        </label>{{jobDetail.companySize}}</p>
      <p>
        <label for="" class="bold">
          公司标签：
        </label>
        <a-tag :color="randomColor" v-for="n in jobDetail.comLabelList" :key="n">{{n}}</a-tag>
      </p>
      <p>
        <label for="" class="bold">
          行业名称：
        </label>{{jobDetail.comIndustryName}}</p>
      <p>
        <label for="" class="bold">
          职位城市：
        </label>{{jobDetail.cityName}}</p>
      <p>
        <label for="" class="bold">
          最低薪资：
        </label>{{jobDetail.salary_min}}k</p>
      <p>
        <label for="" class="bold">
          最高薪资：
        </label>{{jobDetail.salary_max}}k</p>
    </a-drawer>
    {% endraw %}
  </div>
  <script src="https://webapi.amap.com/maps?v=2.0&key=561e624287cdebd75ad99d43e00c53ef&plugin=AMap.CircleEditor,AMap.MarkerClusterer,AMap.ToolBar"></script>
  <script src="/public/js/map.js"></script>
</body>

</html>