'use strict';
const Service = require('egg').Service;

class Zhipin extends Service {
  async test(session) {
    const { ctx } = this;
    if (!session) return;
    const res = await ctx.curl('https://wxapp.zhipin.com/bzminiapp/geek/search/joblist.json?query=&city=101270100&stage=&scale=&industry=&degree=&salary=&experience=&position=&page=1&accountId=1006', {
      dataType: 'json',
      headers: {
        session,
      },
    });
    if (res.data.rescode === 1) {
      return true;
    }
    return res.data.resmsg;
  }
  /**
   *
   * @param {int} pageNum - 页码
   * @param {string} city - 城市
   * @param {string} keyword - 职位关键字
   * @return { array } list - 标准列表
   * @return { string } list[].city - 城市
   * @return { int } list[].companyId - 公司ID
   * @return { string } list[].companyFullName - 公司全称
   * @return { string } list[].companyShortName - 公司简称
   * @return { array } list[].companyLabelList - 公司标签
   * @return { string } list[].companyLogo - + '//www.lgstatic.com/thumbnail_120x120/'
   * @return { string } list[].companySize - 公司人数
   * @return { string } list[].district - 公司所在区县
   * @return { string } list[].education - 学历要求
   * @return { string } list[].createTime - 发布时间 JS Date
   * @return { string } list[].latitude - 纬度
   * @return { string } list[].longitude - 经度
   * @return { string } list[].positionAdvantage - 公司优势 "技术大牛带,年底奖金,公司高速发"
   * @return { string } list[].positionId - 职位ID 判断重复
   * @return { string } list[].positionName - 职位名称
   * @return { int } list[].salary_min - 最低薪资
   * @return { int } list[].salary_max - 最高薪资
   * @return { string } list[].subwayline - 地铁线
   * @return { string } list[].stationname - 地铁站
   * @return { string } list[].workYear - 年资
   * @return { string } list[].jobFrom - 来自
   * @return { string } list[].url - url
   *
   */
  async remoteList(pageNum = 1, city = '101270100', keyword = 'web前端') {
    const { ctx } = this;
    const res = await ctx.curl(`https://wxapp.zhipin.com/bzminiapp/geek/search/joblist.json?query=${encodeURIComponent(keyword)}&city=${city}&stage=&scale=&industry=&degree=&salary=&experience=&position=&page=${pageNum}&accountId=1006`, {
      dataType: 'json',
      headers: {
        session: ctx.app.zhipinCache.session,
      },
    });
    const list = [];
    if (res.data.rescode === 1 && res.data.data.list) {
      const totalCount = -1;
      const cityName = res.data.data.list[0].cityName;
      const insertCount = res.data.data.list.length;
      await this.taskInsert(new Date(), totalCount, cityName, keyword, insertCount);
      for (let i = 0; i < insertCount; i++) {
        const el = res.data.data.list[i];
        const resItem = await this.remoteDetail(el.encryptId, el.lid);
        if (resItem) {
          list.push(resItem);
        } else {
          this.ctx.app.zhipinCache.executedFlag = false;
          break;
        }
      }
    } else {
      console.log('notEnoughFlag, stop');
      this.ctx.app.zhipinCache.executedFlag = false;
    }
    return { list };
  }
  async remoteDetail(encryptId, lid) {
    const { ctx } = this;
    await this.sleep(5000);
    if (ctx.app.zhipinCache.executedFlag === false) {
      console.log('notEnoughFlag, stop');
      return;
    }
    const res = await ctx.curl(`https://wxapp.zhipin.com/bzminiapp/geek/job/detail.json?accountId=1006&jobId=${encryptId}&lid=${lid}&source=&scene=1001`, {
      dataType: 'json',
      headers: {
        session: ctx.app.zhipinCache.session,
      },
    });
    if (res.data.rescode === 1) {
      console.log(`getRemoteDetail: ${res.data.data.brandComInfoVO.comName} | ${res.data.data.jobBaseInfoVO.positionName} - ${encryptId}`);
      return {
        city: res.data.data.jobBaseInfoVO.locationName,
        companyId: res.data.data.brandComInfoVO.encryptBrandId,
        companyFullName: res.data.data.brandComInfoVO.comName,
        companyShortName: res.data.data.brandComInfoVO.brandName,
        companyLabelList: res.data.data.bossBaseInfoVO.teamLureList,
        companyLogo: res.data.data.brandComInfoVO.logo,
        companySize: res.data.data.brandComInfoVO.scaleName,
        district: res.data.data.jobBaseInfoVO.areaDistrict,
        education: res.data.data.jobBaseInfoVO.degreeName,
        createTime: null,
        latitude: res.data.data.jobBaseInfoVO.latitude,
        longitude: res.data.data.jobBaseInfoVO.longitude,
        positionAdvantage: null,
        positionId: encryptId,
        positionName: res.data.data.jobBaseInfoVO.positionName,
        salary_min: res.data.data.jobBaseInfoVO.lowSalary,
        salary_max: res.data.data.jobBaseInfoVO.highSalary,
        subwayline: null,
        stationname: null,
        workYear: res.data.data.jobBaseInfoVO.experienceName,
        jobFrom: 'zhipin',
        desc: res.data.data.jobBaseInfoVO.jobDesc,
        address: res.data.data.jobBaseInfoVO.address,
        url: `https://www.zhipin.com/job_detail/?query=${encodeURIComponent(res.data.data.brandComInfoVO.comName)}`,
      };
    }
    return;
  }
  /**
   * @param {DateTime} create_time - 创建时间
   * @param {int} totalCount - 总数
   * @param {string} city - 城市
   * @param {string} keyword - 关键字
   * @param {string} insertCount - 此次总数
   */
  async taskInsert(create_time, totalCount, city, keyword, insertCount) {
    const client = await this.ctx.service.mongodb.client();
    await client.collection('logs').insertOne({
      type: 'zhipin',
      create_time,
      totalCount,
      city,
      keyword,
      insertCount,
    });
  }
  sleep(time = 5000, info = '') {
    if (info) { console.log(info + 'wait' + time); }
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }
}

module.exports = Zhipin;
