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
        jobFrom: 'lagou',
        jobStatus: 1,
      });
      if (thisCount) {
        this.findAndUpdateDetail();
      } else {
        console.log('no more no-detail item!!! stop');
        ctx.service.lagou.stop();
      }
    } catch (err) {
      console.log(err);
      ctx.service.lagou.stop();
    }
  }
  async findAndUpdateDetail() {
    const { ctx } = this;
    try {
      if (ctx.app.lagouCache.executedFlag === false) {
        console.log('stopFlag');
        return;
      }
      const client = await ctx.service.mongodb.client();
      // find a no-detail item
      const findOneRes = await client.collection('jobs').findOne({
        jobFrom: 'lagou',
        jobStatus: 1,
      });
      if (findOneRes) {
        const remoteDetailRes = await ctx.service.lagou.remoteDetail(findOneRes.jobId);
        if (remoteDetailRes.item) {
          const d = remoteDetailRes.item;
          const jobStatus = d.status === 'ONLINE' ? 2 : d.status === 'EXPIRED' ? 4 : d.status === 'DELETED' ? 3 : `0_${d.status}`;
          const advantageSymbol = /[^\u4e00-\u9fa5]/.test(d.advantage) && /[^\u4e00-\u9fa5]/.exec(d.advantage)[0] || '';
          const comLabelList = d.advantage.split(advantageSymbol);
          await client.collection('jobs').updateOne({ jobId: findOneRes.jobId }, {
            $set: {
              remoteStatus: d.status, // list aboved
              teamDesc: '',
              comLabelList,
              hrId: `${d.publisher.name}-${d.publisher.title}`,
              companyApprove: d.companyApprove,
              districtName: d.district,
              jobDesc: d.description,
              requiredSkills: d.labels,
              address: d.fullAddress,
              longitude: parseFloat(d.longitude) || null,
              latitude: parseFloat(d.latitude) || null,
              comIndustryName: d.companyIndustryField,
              comStageName: d.companyFinanceStage,
              companySize: d.companySize,
              companyFullName: d.companyShortName,
              companyId: d.companyId,
              jobStatus,
            },
            $currentDate: { update_time: true },
          }, {
            upsert: false,
          });
          countNum++;
          timeoutCount = 0;
          console.log(`[${countNum}/${thisCount}]Updated Remote Detail: ${d.companyShortName} | ${d.name} - ${findOneRes.jobId}`);
          await ctx.service.lagou.sleep(2000, 'Get Remote Item wait');
          this.findAndUpdateDetail();
        } else if (timeoutCount < 2) {
          timeoutCount++;
          this.findAndUpdateDetail();
        } else {
          console.log(remoteDetailRes.msg);
          ctx.service.lagou.stop();

        }
      } else {
        console.log('no more no-detail item!!! stop');
        ctx.service.lagou.stop();
      }
    } catch (err) {
      console.log(err);
      ctx.service.lagou.stop();
    }

  }
}

module.exports = ZhipinItemsTask;
