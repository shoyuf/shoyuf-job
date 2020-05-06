const Service = require("egg").Service;
class LagouService extends Service {
  async remoteList(pageNum = 1, city = "成都", keyword = "web前端") {
    try {
      const res = await this.ctx.curl(
        "https://weapp.lagou.com/api/job/search",
        {
          method: "POST",
          data: {
            keyword,
            pageSize: 12,
            city,
            sort: "TIME", // TIME 时间排序 // RELEVANCY 相关性排序
            pageNo: pageNum,
          },
          contentType: "json",
          dataType: "json",
          headers: {
            Referer:
              "https://servicewechat.com/wx7523c9b73699af04/201/page-frame.html",
          },
        }
      );
      /**
       * @returns { Object } {data:object[...result:arr],success:Boolean}
       * @return.result[city] 城市名称
       * @return.result[companyApprove] {int} 未知意义，列表为1，详情为2
       * @return.result[companyFinanceStage] 公司融资状态
       * @return.result[companyId] {int} 公司ID
       * @return.result[companyIndustryField] 公司行业list[str]
       * @return.result[companyLogo] 品牌logo
       * @return.result[companyShortName] 公司简称
       * @return.result[companySize] 公司规模
       * @return.result[education] 学历需求
       * @return.result[formattedUpdatedAt] 格式化更新时间，2天前发布
       * @return.result[id] {int} 职位ID
       * @return.result[name] 职位名称
       * @return.result[salary] 薪资
       * @return.result[type] 职位类型 全职／兼职
       * @return.result[workYear] 职位经验
       */
      if (res.headers["content-type"] === "text/html") {
        // 404
        return { list: [], msg: res.data };
      } else if (res.data.data) {
        // correct
        return { list: res.data.data.result || [], msg: res.data };
      } else {
        // fail
        return { list: [], msg: res.data };
      }
    } catch (err) {
      return { list: [], msg: err };
    }
  }
  async remoteDetail(jobId) {
    const { ctx } = this;
    try {
      if (ctx.app.lagouCache.executedFlag === false) {
        console.log("stopFlag, stop");
        return;
      }
      const res = await ctx.curl(`https://weapp.lagou.com/api/job/${jobId}`, {
        dataType: "json",
        headers: {
          Referer:
            "https://servicewechat.com/wx7523c9b73699af04/201/page-frame.html",
        },
      });
      /**
       * @returns { Object } {data:object[...],success:boolean}
       * @return data.advantage 团队tag[str]
         @return data.city 城市名称
         @return data.companyApprove {int} 未知意义，列表为1，详情为2
         @return data.companyFinanceStage 融资状态
         @return data.companyId 公司ID
         @return data.companyIndustryField 公司行业list[str]
         @return data.companyLogo 品牌logo
         @return data.companyShortName 公司简称
         @return data.companySize 公司规模
         @return data.createdBy {int} 职位创建者ID
         @return data.description 职位描述
         @return data.district 所属区县
         @return data.education 学历要求
         @return data.formattedUpdatedAt 格式化更新时间，时分
         @return data.fullAddress 公司地址
         @return data.id {int} jobId
         @return data.isInviteTpl{boolean} 是否为邀请模板
         @return data.isShowDanke {boolean}是否显示蛋壳？
         @return data.labels {Array} 职位标签
         @return data.latitude 纬度
         @return data.longitude 经度
         @return data.name 职位名称
         @return data.province 省份
         @return data.publisher 发布者信息
         @return data.salary 薪资
         @return data.status 职位状态 ONLINE EXPIRED DELETED
         @return data.street 公司街道
         @return data.type 兼职全职实习
         @return data.updatedAt 更新时间，截止日期时分
         @return data.workYear 职位经验
       */
      if (res.headers["content-type"] === "text/html") {
        // 请求错误
        return { item: null, msg: Object.assign(res.data, { jobId }) };
      } else if (res.data.data) {
        // correct
        return { item: res.data.data };
      } else {
        // fail
        return { item: null, msg: res.data };
      }
    } catch (err) {
      return { item: null, msg: err };
    }
  }
  sleep(time = 5000, info = "") {
    if (info) {
      console.log(info + "wait" + time);
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }
  stop() {
    console.log("stop!!!! info ⬆️");
    this.ctx.app.lagouCache.executedFlag = false;
  }
}

module.exports = LagouService;
