'use strict';
const Subscription = require('egg').Subscription;
let countNum, // 已更新总数
  timeoutCount, // 超时次数
  thisCount, // 本次更新总数
  changeCount; // 本次更新成功总数

/**
 * todo
 * 1. test session 功能
 */

/**
 * @var jobStatus
 * 0:被手动删除
 * 1:无详情
 * 2:有详情
 * 3:远程职位不存在
 * 4:远程职位停止招聘
 */

class ZhipinItemsTask extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      immediate: false,
      type: 'worker', // 指定所有的 worker 都需要执行
      disable: true,
    };
  }
  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    countNum = 0;
    timeoutCount = 0;
    changeCount = 0;
    this.testRecently();
  }
  async testRecently() {
    const { ctx } = this;
    const client = await ctx.service.mongodb.client();
    try {
      const recentDay = await client.collection('jobs').findOne({
        jobFrom: 'zhipin',
        jobStatus: 2, // 有详情
      }, {
        sort: {
          update_time: -1,
        },
      });
      const _o = new Date(recentDay.update_time);
      const d = new Date(_o.getFullYear(), _o.getMonth(), _o.getDate());
      thisCount = await client.collection('jobs').countDocuments({
        jobFrom: 'zhipin',
        jobStatus: 2, // 有详情
        remoteStatus: 1, // 远程状态正常
        update_time: { $lt: d },
      });
      if (recentDay) {
        console.log(`this update count is ${thisCount} // ${d}`);
        this.findAndUpdateDetail(d);
      } else {
        console.log('no one item!');
        ctx.service.zhipin.stop();
      }
    } catch (err) {
      console.log(err);
      ctx.service.zhipin.stop();
    }
  }
  async findAndUpdateDetail(recentDay) {
    const { ctx } = this;
    try {
      if (ctx.app.zhipinCache.executedFlag === false) {
        console.log('stopFlag');
        return;
      }
      const client = await ctx.service.mongodb.client();
      // find a lateset item 上一次更新列表中在列表里面的

      const findOneRes = await client.collection('jobs').findOne({
        jobFrom: 'zhipin',
        jobStatus: 2, // 有详情
        remoteStatus: 1, // 远程状态正常
        update_time: { $lt: new Date(recentDay) },
      }, {
        sort: {
          update_time: 1,
        },
      });
      if (findOneRes) {
        const remoteDetailRes = await ctx.service.zhipin.remoteDetail(findOneRes.jobId, findOneRes.zhipin_cache_lid);
        if (remoteDetailRes.item) {
          const { bossBaseInfoVO, jobBaseInfoVO, brandComInfoVO } = remoteDetailRes.item;
          const jobStatus = jobBaseInfoVO.jobValidStatus === 1 ? 2 : jobBaseInfoVO.jobValidStatus === 2 ? 4 : `0_${jobBaseInfoVO.jobValidStatus}`;
          await client.collection('jobs').updateOne({ jobId: findOneRes.jobId }, {
            $set: {
              remoteStatus: jobBaseInfoVO.jobValidStatus, // list aboved
              teamDesc: bossBaseInfoVO.teamDesc,
              comLabelList: bossBaseInfoVO.teamLureList,
              hrId: bossBaseInfoVO.encryptBossId,
              expectId: jobBaseInfoVO.expectId,
              districtName: jobBaseInfoVO.areaDistrict,
              jobDesc: jobBaseInfoVO.jobDesc,
              requiredSkills: jobBaseInfoVO.requiredSkills,
              address: jobBaseInfoVO.address,
              longitude: jobBaseInfoVO.longitude,
              latitude: jobBaseInfoVO.latitude,
              comIndustryName: brandComInfoVO.industryName,
              comStageName: brandComInfoVO.stageName,
              companySize: brandComInfoVO.scaleName,
              companyFullName: brandComInfoVO.comName,
              companyId: brandComInfoVO.encryptBrandId,
              jobStatus,
            },
            $currentDate: { update_time: true },
          }, {
            upsert: false,
          });
          if (jobBaseInfoVO.jobValidStatus !== findOneRes.remoteStatus) changeCount++;
          countNum++;
          timeoutCount = 0;
          console.log(`[${countNum}/${thisCount} | ${changeCount} 😷 ]updated Older Detail: ${brandComInfoVO.comName} | ${findOneRes.jobId} | ${findOneRes.remoteStatus} -> ${jobBaseInfoVO.jobValidStatus}`);
          await ctx.service.zhipin.sleep(5000, 'Get Older Item Wait');
          this.findAndUpdateDetail(recentDay);
        } else if (remoteDetailRes.msg.rescode === 3001) {
          console.log(remoteDetailRes.msg);
          timeoutCount = 0;
          await client.collection('jobs').updateOne({ jobId: findOneRes.jobId }, {
            $set: { jobStatus: 3 },
          });
          await ctx.service.zhipin.sleep(4000, 'Get Older Item Wait');
          this.findAndUpdateDetail(recentDay);
        } else if (timeoutCount < 2) {
          timeoutCount++;
          this.findAndUpdateDetail(recentDay);
        } else {
          console.log(remoteDetailRes.msg);
          ctx.service.zhipin.stop();
        }
      } else {
        console.log('no more older item!!! stop');
        ctx.service.zhipin.stop();
      }
    } catch (err) {
      console.log(err);
      ctx.service.zhipin.stop();
    }

  }
}

module.exports = ZhipinItemsTask;
