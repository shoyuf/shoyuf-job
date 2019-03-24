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
    return res.data;
  }
  async remoteList(pageNum = 1, city = '101270100', keyword = 'web前端') {
    try {
      const { ctx } = this;
      const res = await ctx.curl(`https://wxapp.zhipin.com/bzminiapp/geek/search/joblist.json?query=${encodeURIComponent(keyword)}&city=${city}&stage=&scale=&industry=&degree=&salary=&experience=&position=&page=${pageNum}&accountId=1006`, {
        dataType: 'json',
        headers: {
          session: ctx.app.zhipinCache.session,
        },
      });
      /**
       * @returns { Object } {rescode:int,resmsg:str,data:object[list:arr,hasMore:boolean]}
       * @return.list[jobName] 职位名称
       * @return.list[jobValidStatus] {int} 有效状态
       * @return.list[jobExperience] 职位经验
       * @return.list[jobDegree] 学历需求
       * @return.list[jobSalary] 薪资
       * @return.list[cityName] 城市名称
       * @return.list[lid] 查询职位详情需要用的lid
       * @return.list[brandName] 品牌名称
       * @return.list[brandLogo] 品牌logo
       * @return.list[bossName] boss名称
       * @return.list[bossTitle] boss title
       * @return.list[bossAvatar] boss头像
       * @return.list[encryptId] 查询职位详情需要用的encryptId,也就是jobId
       */
      if (res.data.rescode === 1) {
        return { list: res.data.data.list || [], msg: res.data };
      } else {
        return { list: [], msg: res.data };
      }
    } catch (err) {
      return { list: [], msg: err };
    }
  }
  async remoteDetail(encryptId, lid) {
    const { ctx } = this;
    try {
      if (ctx.app.zhipinCache.executedFlag === false) {
        console.log('stopFlag, stop');
        return;
      }
      const res = await ctx.curl(`https://wxapp.zhipin.com/bzminiapp/geek/job/detail.json?accountId=1006&jobId=${encryptId}&lid=${lid}&source=&scene=1001`, {
        dataType: 'json',
        headers: {
          session: ctx.app.zhipinCache.session,
        },
      });
      /**
       * @returns { Object } {rescode:int,resmsg:str,data:object[bossBaseInfoVO,jobBaseInfoVo,brandComInfoVo,headhunterInfoVo,realationInfoVo]}
       * @return.bossBaseInfoVO teamDesc 团队简介
       * @return.bossBaseInfoVO teamLureList { Array } 团队tag
       * @return.bossBaseInfoVO encryptBossId bossID
       * @return.jobBaseInfoVO jobId JobID
       * @return.jobBaseInfoVO expectId unknow
       * @return.jobBaseInfoVO jobValidStatus { Int } 职位状态
       * @return.jobBaseInfoVO positionName 职位名称
       * @return.jobBaseInfoVO locationName 城市名称
       * @return.jobBaseInfoVO areaDistrict 所属区县
       * @return.jobBaseInfoVO businessDistrict 所属商业区
       * @return.jobBaseInfoVO experienceName 职位经验 1-3年
       * @return.jobBaseInfoVO degreeName 学历要求
       * @return.jobBaseInfoVO lowSalary { int } 最低薪资
       * @return.jobBaseInfoVO highSalary { int } 最高薪资
       * @return.jobBaseInfoVO jobDesc 职位描述
       * @return.jobBaseInfoVO requiredSkills { Array } 所需技能
       * @return.jobBaseInfoVO address 地址
       * @return.jobBaseInfoVO longitude { int } 经度
       * @return.jobBaseInfoVO latitude { int } 纬度
       * @return.jobBaseInfoVO salaryDesc 薪资描述文本
       * @return.brandComInfoVO brandName 品牌名称
       * @return.brandComInfoVO industryName 产业名称
       * @return.brandComInfoVO stageName 融资状态
       * @return.brandComInfoVO scaleName 公司人数规模
       * @return.brandComInfoVO comName 公司全称
       * @return.brandComInfoVO encryptBrandId 公司ID
       * @return.headhunterInfoVo 猎头信息
       * @return.realationInfoVo 关系信息
       */
      if (res.data.rescode === 1) {
        console.log(`gotRemoteDetail: ${res.data.data.brandComInfoVO.comName} | ${res.data.data.jobBaseInfoVO.positionName} - ${encryptId}`);
        return { item: res.data.data };
      } else {
        // 1001 未授权 || 被风控 || 3001 职位不存在
        return { item: null, msg: Object.assign(res.data, { encryptId }) };
      }
    } catch (err) {
      return { item: null, msg: err };
    }
  }
  sleep(time = 5000, info = '') {
    if (info) { console.log(info + 'wait' + time); }
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }
  stop() {
    console.log('stop!!!! info ⬆️');
    this.ctx.app.zhipinCache.executedFlag = false;
  }
}

module.exports = Zhipin;
