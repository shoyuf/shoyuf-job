'use strict';

const Service = require('egg').Service;

class LagouService extends Service {
  /**
   * @param {int} pageNum - 页码
   * @param {string} city - 城市
   * @param {string} keyword - 职位关键字
   * @param {string} gzxz - 工作性质
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
   * @return { string } list[].createTime - 发布时间 "2018-09-05 15:05:14"
   * @return { string } list[].latitude - 纬度
   * @return { string } list[].longitude - 经度
   * @return { string } list[].positionAdvantage - 公司优势 "技术大牛带,年底奖金,公司高速发"
   * @return { string } list[].positionId - 职位ID 判断重复
   * @return { string } list[].positionName - 职位名称
   * @return { string } list[].salary - 薪资 "12k-20k"
   * @return { string } list[].subwayline - 地铁线
   * @return { string } list[].stationname - 地铁站
   * @return { string } list[].workYear - 年资
   * @return { string } list[].jobForm - 来自
   * @return { string } list[].url - url
   */
  async remoteList(pageNum = 1, city = '成都', keyword = 'web前端', gzxz = '全职') {
    const refererStr = `https://www.lagou.com/jobs/list_${encodeURI(keyword)}?px=new&city=${encodeURI(city)}`; // sort => time
    const res = await this.ctx.curl(`https://www.lagou.com/jobs/positionAjax.json?px=new&gx=${encodeURI(gzxz)}&city=${encodeURI(city)}&needAddtionalResult=false`, {
      method: 'POST',
      data: {
        first: true, // sort => time
        pn: pageNum, // page number
        kd: keyword, // page number
      },
      dataType: 'json',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Referer: refererStr,
      },
    });
    const list = [];
    if (res.data.content) {
      const totalCount = res.data.content.positionResult.totalCount;
      const cityName = res.data.content.positionResult.locationInfo.city;
      const positionName = res.data.content.positionResult.queryAnalysisInfo.positionName;
      const insertCount = res.data.content.positionResult.resultSize || -1;
      await this.taskInsert(new Date(), totalCount, cityName, positionName, insertCount);
      res.data.content.positionResult.result.forEach(el => {
        list.push({
          city: el.city,
          companyId: el.companyId,
          companyFullName: el.companyFullName,
          companyShortName: el.companyShortName,
          companyLabelList: el.companyLabelList,
          companyLogo: '//www.lgstatic.com/thumbnail_120x120/' + el.companyLogo,
          companySize: el.companySize,
          district: el.district,
          education: el.education,
          createTime: el.createTime,
          latitude: el.latitude,
          longitude: el.longitude,
          positionAdvantage: el.positionAdvantage,
          positionId: el.positionId,
          positionName: el.positionName,
          salary: el.salary,
          subwayline: el.subwayline,
          stationname: el.stationname,
          workYear: el.workYear,
          jobForm: 'lagou',
          url: `https://www.lagou.com/jobs/${el.positionId}.html`,
        });
      });
      return {
        list,
      };
    }
    console.log(res.data);
    return { list: [] };
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
      type: 'lagou',
      create_time,
      totalCount,
      city,
      keyword,
      insertCount,
    });
  }
  // async fuckSpider(list, refererStr) {
  //   const arr = [];
  //   list.forEach(el => {
  //     arr.push(el.companyId);
  //   });
  //   const res = await this.ctx.curl(`https://www.lagou.com/c/approve.json?companyIds=${encodeURIComponent(arr.toString())}`, {
  //     dataType: 'json',
  //     headers: {
  //       Referer: refererStr,
  //       'X-Requested-With': ' XMLHttpRequest',
  //     },
  //   });
  //   if (res.data.state !== 1) {
  //     console.log(res.data, 'Fucking Spider Fail');
  //   } else {
  //     return true;
  //   }
  // }
  async list(currentPage = 1) {
    const { ctx } = this;
    const pageSize = 1000;
    const client = await ctx.service.mongodb.client();
    const skip = currentPage === 1 ? 0 : pageSize * (currentPage - 1);
    // const filter = status === 1 ? { status: 1 } : {};
    const filter = {};
    const res = await client.collection('jobs').find(filter, {
      limit: pageSize, skip,
      sort: {
        createTime: -1,
      },
    }).toArray();
    // const maxPage = Math.ceil(await client.collection('jobs').find(filter).count() / pageSize);
    const maxPage = 1;
    return Object.assign(res, { pageInfo: { maxPage, currentPage: parseInt(currentPage, 10) } });
  }
}

module.exports = LagouService;
