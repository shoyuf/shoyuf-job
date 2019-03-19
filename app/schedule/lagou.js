'use strict';

const Subscription = require('egg').Subscription;
const moment = require('moment');
let currentPage = 1;
const totalPage = 'unknown';
let updatedExistingNum = 0;

let notEnoughFlag = false; // not enough 15
let notTodayFlag = false; // not today


class algoliaInit extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      immediate: false,
      cron: '0 0 */8 * * *',
      type: 'worker', // 指定所有的 worker 都需要执行
    };
  }
  /**
   * get yesterday data
   */
  async subscribe() {
    this.remote(currentPage);
  }
  /**
   * get Page
   */
  async remote() {
    try {
      if (this.ctx.app.lagouCache.executedFlag === false) {
        console.log('stopFlag, stop');
        return;
      }
      if (notEnoughFlag) {
        this.stopTask();
        console.log('notEnoughFlag, stop');
        return;
      }
      if (notTodayFlag) {
        this.stopTask();
        console.log('notTodayFlag, stop');
        return;
      }
      const { ctx } = this;
      const res = await ctx.service.lagou.remoteList(currentPage, '成都', 'web前端');
      if (res.list.length) {
        await this.findAndUpadte(res.list);
        if (res.list.length !== 15) {
          console.log('not enough 15!!!!!');
          notEnoughFlag = true;
        }
      }
      await this.sleep(120000, 'remote');
      currentPage += 1;
      this.remote();
    } catch (err) {
      this.stopTask();
      console.log(err);
      // await this.sleep(600000);
    }
  }
  stopTask() {
    this.ctx.app.lagouCache.executedFlag = false;
  }
  /**
   * @param {array} arr - list
   */
  async findAndUpadte(arr) {
    const { ctx } = this;
    const client = await ctx.service.mongodb.client();
    for (let i = 0, len = arr.length; i < len; i++) {
      if (moment(arr[i].createTime).date() !== moment().date()) {
        notTodayFlag = true;
      }
      arr[i].update_time = new Date();
      const insertRes = await client.collection('jobs').findOneAndUpdate({ positionId: arr[i].positionId }, {
        $set: arr[i],
      }, {
        upsert: true,
        returnOriginal: false,
      });
      if (insertRes.lastErrorObject.updatedExisting) updatedExistingNum += 1;
      if (insertRes.ok) console.log(`page:${currentPage}/${totalPage},alreadyNum:${updatedExistingNum}: ${arr[i].companyFullName} | ${arr[i].positionName}`);
    }
  }
  sleep(time = 60000, info = '') {
    console.log(info + 'wait' + time);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }
}

module.exports = algoliaInit;
