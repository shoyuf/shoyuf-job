/* eslint-disable */
NProgress.start();
let homeMarker, circleEdit, jobClusterer;
const colorList = ['lightsalmon', 'salmon', 'darksalmon', 'lightcoral', 'indianred', 'crimson', 'firebrick', 'red', 'darkred', 'coral', 'tomato', 'orangered', 'gold', 'orange', 'darkorange', 'lightyellow', 'lemonchiffon', 'moccasin', 'peachpuff', 'palegoldenrod', 'khaki', 'darkkhaki', 'limegreen', 'lime', 'forestgreen', 'green', 'darkgreen', 'greenyellow', 'yellowgreen', 'springgreen', 'mediumspringgreen', 'lightgreen', 'palegreen', 'darkseagreen', 'mediumseagreen', 'seagreen', 'olive', 'darkolivegreen', 'olivedrab	', 'aqua', 'mediumaquamarine', 'paleturquoise', 'turquoise', 'lightseagreen', 'cadetblue', 'darkcyan', 'teal', 'powderblue', 'lightskyblue', 'deepskyblue', 'lightsteelblue', 'dodgerblue', 'cornflowerblue', 'steelblue', 'royalblue', 'mediumblue', 'darkblue', 'midnightblue', 'mediumslateblue', 'darkslateblue', 'lavender', 'thistle', 'plum', 'orchid', 'magenta', 'mediumorchid', 'mediumpurple', 'blueviolet', 'darkviolet', 'darkorchid', 'darkmagenta', 'indigo', 'pink', 'hotpink', 'deeppink', 'palevioletred', 'mediumvioletred', 'gainsboro', 'silver', 'gray', 'dimgray', 'lightslategray', 'slategray', 'darkslategray', 'black', 'navajowhite', 'tan', 'rosybrown', 'sandybrown', 'goldenrod', 'peru', 'chocolate', 'saddlebrown', 'sienna', 'brown', 'maroon'];
let aMap = new AMap.Map('container', {
  showIndoorMap: false,
  mapStyle: 'amap://styles/c4df92f5249831f6e56519481f366553',
  center: [104.18643951818353, 36.8815429424562],
  zoom: 5,
});
aMap.addControl(new AMap.ToolBar({
  position: 'LB',
  liteStyle: true
}));
aMap.on("complete", function () {
  NProgress.done();
});

const {lat ,lng} = aMap.getCenter()
const mapCenter = {lat ,lng}

const app = new Vue({
  el: '#app',
  data() {
    return {
      jobDetail: {
        companyFullName: '',
      },
      drawerVisible: false,
      blockedList: JSON.parse(localStorage.getItem('blockedList')) || [],
      favoriteList: JSON.parse(localStorage.getItem('favoriteList')) || [],
      homePosition: JSON.parse(localStorage.getItem('homePosition')) || mapCenter,
      circleRadius: JSON.parse(localStorage.getItem('circleRadius')) || 1000,
      jobList: [],
      low_salary: 12,
      jobExperience: '全部',
      jobExperienceList: [],
      markersNum: 0,
    };
  },
  watch: {
    blockedList(val) {
      localStorage.setItem('blockedList', JSON.stringify(Array.from(new Set(val))));
    },
    favoriteList(val) {
      localStorage.setItem('favoriteList', JSON.stringify(Array.from(new Set(val))));
    },
    homePosition(val) {
      localStorage.setItem('homePosition', JSON.stringify(val));
    },
    circleRadius(val) {
      localStorage.setItem('circleRadius', JSON.stringify(val));
    },
  },
  computed: {
    randomColor() {
      return colorList[Math.floor(Math.random() * colorList.length)];
    },
  },
  methods: {
    toggleHomeMarker() {
      if (homeMarker) {
        circleEdit.close();
        homeMarker.setMap(null);
        homeMarker = null;
      } else {
        homeMarker = new AMap.Circle({
          center: new AMap.LngLat(this.homePosition.lng, this.homePosition.lat) || mapCenter,
          radius: this.circleRadius,
          stokeColor: '#1890ff',
          strokeOpacity: 0.2,
          strokeWeight: 2,
          strokeStyle: 'dashed',
          strokeDasharray: [5, 5],
          fillOpacity: 0.4,
          fillColor: '#1791fc',
        });
        homeMarker.setMap(aMap);
        circleEdit = new AMap.CircleEditor(aMap, homeMarker);
        circleEdit.open();
        circleEdit.on('adjust', e => {
          this.circleRadius = e.radius;
        });
        circleEdit.on('move', ({ lnglat: { lat,lng}}) => {
          this.homePosition = {lat ,lng};
        });
      }
    },
    blockJob() {
      const currentJob = this.jobDetail;
      const index = this.blockedList.indexOf(currentJob.jobId);

      this.jobDetail.blocked = !currentJob.blocked;
      this.jobList[this.jobDetail.index].blocked = !this.jobList[this.jobDetail.index].blocked
      if (index !== -1) {
        // 取消屏蔽
        this.jobDetail.marker.show()
        this.blockedList.splice(index, 1);
        this.markersNum++;
      } else {
        // 添加屏蔽
        this.jobDetail.marker.hide()
        this.blockedList.push(currentJob.jobId);
        this.markersNum--;
        this.drawerVisible = false;
      }
    },
    toggleFavoriteJob() {
      const currentJob = this.jobDetail;
      const index = this.favoriteList.indexOf(currentJob.jobId);

      this.jobDetail.favorited = !currentJob.favorited;
      this.jobList[this.jobDetail.index].favorited = !this.jobList[this.jobDetail.index].favorited
      if (index !== -1) {
        // 取消收藏
        this.favoriteList.splice(index, 1);
        this.markersNum++;
      } else {
        // 添加收藏
        this.favoriteList.push(currentJob.jobId);
        this.markersNum--;
      }
      currentJob.marker.setContent(`<div class="map-icon ${currentJob.jobFrom} ${this.jobDetail.favorited ? 'favorited' : ''}" data-name="${currentJob.companyShortName}"></div>`);
    },
    async emptyBlockedList() {
      this.blockedList = [];
      await this.getList()
      this.filter()
    },
    // 筛选查询
    filter() {
      if (this.low_salary === undefined) {
        this.$message.warning('请先选择最低接受薪资');
        return;
      }
      // not Favorited & not Blocked
      let notFavArr = this.jobList.filter(el => {
        el.favorited && el.marker.show();
        if (this.jobExperience === '全部') {
          return !el.favorited && !el.blocked && el.salary_max >= this.low_salary && !el.marker.show()
        } else {
          return !el.favorited && !el.blocked && el.salary_max >= this.low_salary && this.jobExperience === el.jobExperience && !el.marker.show()
        }
      });
      this.markersNum = notFavArr.length;
    },
    addAllMarkers() {
      this.low_salary = 0;
      this.jobExperience = '全部';
      this.filter()
    },
    async getList() {
      const res = await axios.get('/resources');
      this.jobList = res.data.list;
      // cache list, speed up indexOf!
      const cache_favoriteList = JSON.parse(JSON.stringify(this.favoriteList));
      const cache_blockedList = JSON.parse(JSON.stringify(this.blockedList));
      this.jobList.forEach((e, index) => {
        const lng = parseFloat(e.longitude, 10) || 0;
        const lat = parseFloat(e.latitude, 10) || 0;
        let favorited, blocked;
        const fIndex = cache_favoriteList.indexOf(e.jobId)
        if (fIndex !== -1) {
          favorited = true
          cache_favoriteList.splice(fIndex, 1)
        }
        const bIndex = cache_blockedList.indexOf(e.jobId)
        if (bIndex !== -1) {
          blocked = true
          cache_blockedList.splice(bIndex, 1)
        }
        const marker = new AMap.Marker({
          map: aMap,
          visible: false,
          draggable: true,
          animation: 'AMAP_ANIMATION_DROP',
          title: e.companyShortName,
          position: [lng, lat], // 位置
          content: `<div class="map-icon ${e.jobFrom} ${favorited ? 'favorited' : ''}" data-name="${e.companyShortName}"></div>`,
        });
        Object.assign(e, { marker, favorited: favorited, blocked: blocked, index })
        AMap.Event.addListener(marker, 'click', async () => {
          NProgress.start();
          const resItem = await axios.get('/resources/' + e._id);
          // this.jobDetail = Object.assign(resItem.data, e);
          this.jobDetail = resItem.data
          this.jobDetail.marker = e.marker
          this.jobDetail.favorited = e.favorited
          this.jobDetail.blocked = e.blocked
          this.jobDetail.index = e.index
          this.drawerVisible = true;
          NProgress.done();
        });
      })
      this.jobExperienceList = res.data.filters.jobExperience.map(e => e._id);
    },
  },
  mounted() {
    this.getList();
  },
});
