'use strict';
const Subscription = require('egg').Subscription;
let countNum,
  timeoutCount,
  thisCount;
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
    thisCount = 0;
    this.testCount();
  }
  async testCount() {
    const { ctx } = this;
    try {
      const client = await ctx.service.mongodb.client();
      thisCount = await client.collection('jobs').countDocuments({
        jobFrom: 'zhipin',
        jobStatus: 1,
      });
      if (thisCount) {
        this.findAndUpdateDetail();
      } else {
        console.log('no more no-detail item!!! stop');
        ctx.service.zhipin.stop();
      }
    } catch (err) {
      console.log(err);
      ctx.service.zhipin.stop();
    }
  }
  async findAndUpdateDetail() {
    const { ctx } = this;
    try {
      if (ctx.app.zhipinCache.executedFlag === false) {
        console.log('stopFlag');
        return;
      }
      const client = await ctx.service.mongodb.client();
      // find a no-detail item
      const findOneRes = await client.collection('jobs').findOne({
        jobFrom: 'zhipin',
        jobStatus: 1,
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
          countNum++;
          timeoutCount = 0;
          console.log(`[${countNum}/${thisCount}]Updated Remote Detail: ${brandComInfoVO.comName} | ${jobBaseInfoVO.positionName} - ${findOneRes.jobId}`);
          await ctx.service.zhipin.sleep(5000, 'Get Remote Item wait');
          this.findAndUpdateDetail();
        } else if (remoteDetailRes.msg.rescode === 3001) {
          console.log(remoteDetailRes.msg);
          timeoutCount = 0;
          await client.collection('jobs').updateOne({ jobId: findOneRes.jobId }, {
            $set: { jobStatus: 3 },
          });
          await ctx.service.zhipin.sleep(4000, 'Get Remote Item wait');
          this.findAndUpdateDetail();
        } else if (timeoutCount < 2) {
          timeoutCount++;
          this.findAndUpdateDetail();
        } else {
          console.log(remoteDetailRes.msg);
          ctx.service.zhipin.stop();

        }
      } else {
        console.log('no more no-detail item!!! stop');
        ctx.service.zhipin.stop();
      }
    } catch (err) {
      console.log(err);
      ctx.service.zhipin.stop();
    }

  }
}

module.exports = ZhipinItemsTask;
