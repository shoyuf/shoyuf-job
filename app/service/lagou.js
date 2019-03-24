'use strict';

const Service = require('egg').Service;
const moment = require('moment');
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
    if (res.headers['content-type'] !== 'text/html' && res.data.content) {
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
          createTime: moment(el.createTime).isValid() ? moment(el.createTime).clone().toDate() : null,
          latitude: el.latitude,
          longitude: el.longitude,
          positionAdvantage: el.positionAdvantage,
          positionId: el.positionId,
          positionName: el.positionName,
          salary_min: parseInt(el.salary.split('-')[0].split('k')[0]) || null,
          salary_max: parseInt(el.salary.split('-')[1].split('k')[0]) || null,
          subwayline: el.subwayline,
          stationname: el.stationname,
          workYear: el.workYear,
          address: null,
          desc: null,
          jobFrom: 'lagou',
          url: `https://www.lagou.com/jobs/${el.positionId}.html`,
        });
      });
      return {
        list,
      };
    }
    this.ctx.app.lagouCache.executedFlag = false;
    console.log('返回数据错误！', res.data);
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
}

module.exports = LagouService;
