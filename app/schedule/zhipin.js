

'use strict';
const Subscription = require('egg').Subscription;
let currentPage = 1;
const totalPage = 'unknown';
let updatedExistingNum = 0;

let notEnoughFlag = false; // not enough 15

class ZhipinTask extends Subscription {
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
    this.remote(currentPage);
  }
  async remote() {
    try {
      const { ctx } = this;
      if (notEnoughFlag) {
        console.log('notEnoughFlag, stop');
        this.stop();
        return;
      }
      if (ctx.app.zhipinCache.executedFlag === false) {
        console.log('stopFlag');
        return;
      }
      const res = await ctx.service.zhipin.remoteList(currentPage, '101270100', 'web前端');
      if (res.list.length) {
        await this.findAndUpadte(res.list);
      } else {
        console.log('res.list.length 0!!!!!');
        notEnoughFlag = true;
      }
      await this.sleep(1000, 'remote');
      currentPage += 1;
      this.remote();
    } catch (err) {
      console.log(err);
    }
  }
  /**
   * @param {array} arr - list
   */
  async findAndUpadte(arr) {
    const { ctx } = this;
    const client = await ctx.service.mongodb.client();
    for (let i = 0, len = arr.length; i < len; i++) {
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
  stop() {
    this.ctx.app.zhipinCache.executedFlag = false;
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

module.exports = ZhipinTask;
