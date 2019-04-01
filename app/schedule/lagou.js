'use strict';
const Subscription = require('egg').Subscription;
let currentPage,
  addCount,
  getCount;
const keyword = 'web前端';
/**
 * @var jobStatus
 * 0:被手动删除
 * 1:无详情
 * 2:有详情
 * 3:远程职位不存在
 * 4:远程职位停止招聘
 */

class LagouTask extends Subscription {
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
    currentPage = 1;
    addCount = 0;
    getCount = 0;
    this.remote();
  }
  async remote() {
    const { ctx } = this;
    try {
      // 最后一页
      if (ctx.app.lagouCache.executedFlag === false) {
        console.log('stopFlag');
        return;
      }
      const res = await ctx.service.lagou.remoteList(currentPage, '成都', 'web前端');
      if (res.list.length) {
        await this.findAndUpadte(res.list);
      } else if (res.list.length === 0 && res.msg.success) {
        console.log(`last page,no more data,this time got ${getCount} added ${addCount}！`);
        // 此处可以开始读取没有详情的jobDetail数据
        ctx.service.lagou.stop();
      } else {
        console.log(res.msg);
        ctx.service.lagou.stop();
      }
    } catch (err) {
      console.log(err);
      ctx.service.lagou.stop();
    }
  }
  /**
   * @param {array} arr - list
   */
  async findAndUpadte(arr) {
    const { ctx } = this;
    try {
      const client = await ctx.service.mongodb.client();
      const totalCount = arr.length;
      let updatedCount = 0;
      for (let i = 0; i < totalCount; i++) {
        getCount++;
        const el = arr[i];
        // 列表里面的 encryptId 是 jobId
        const salary_min = el.salary.match(/\d+/g) ? el.salary.match(/\d+/g)[0] : null;
        const salary_max = el.salary.match(/\d+/g) ? el.salary.match(/\d+/g)[1] : null;
        const jobStatus = 1; // lagou 列表里面没有状态，所以都为 1 无详情状态
        const findRes = await client.collection('jobs').findOneAndUpdate({ jobId: el.id }, {
          $set: {
            jobId: el.id,
            remoteStatus: 'ONLINE',
            jobName: el.name,
            cityName: el.city,
            jobExperience: el.workYear,
            degreeName: el.education,
            salary_min,
            salary_max,
            salaryDesc: el.salary,
            companyShortName: el.companyShortName,
            companyLogo: el.companyLogo,
            jobFrom: 'lagou',
          },
          $currentDate: { update_time: true },
          $setOnInsert: {
            create_time: new Date(),
            jobStatus,
          },
        }, {
          upsert: true,
          returnOriginal: false,
        });
        if (findRes.lastErrorObject.updatedExisting) {
          updatedCount++;
        }
      }
      console.log(`Updated Remote List: ${totalCount} | updated Data: ${updatedCount} | time: ${new Date()}`);
      await ctx.service.lagou.sleep(1000, 'Get Remote List wait');
      addCount = addCount + totalCount - updatedCount;
      currentPage += 1;
      this.remote();
      this.taskInsert(new Date(), totalCount, arr[0].city, keyword, updatedCount);
    } catch (err) {
      console.log(err);
      ctx.service.lagou.stop();
    }
  }
  /**
   * @param {DateTime} create_time - 创建时间
   * @param {int} totalCount - 本页总数
   * @param {string} city - 城市
   * @param {string} keyword - 关键字
   * @param {string} updatedCount - 本次更新总数
   */
  async taskInsert(create_time, totalCount, city, keyword, updatedCount) {
    const client = await this.ctx.service.mongodb.client();
    await client.collection('logs').insertOne({
      type: 'lagou',
      create_time,
      totalCount,
      city,
      keyword,
      updatedCount,
    });
  }
}

module.exports = LagouTask;
