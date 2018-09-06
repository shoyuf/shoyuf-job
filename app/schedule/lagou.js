'use strict';

const Subscription = require('egg').Subscription;
let currentPage = 1;
const totalPage = 'unknown';
let updatedExistingNum = 0;

let notEnoughFlag = false; // not enough 15


class algoliaInit extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      immediate: true,
      cron: '0 0 */4 * * *',
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
      if (notEnoughFlag) {
        console.log('notEnoughFlag, stop');
        return;
      }
      if (updatedExistingNum > 29) {
        console.log('updatedExistingNum > 29, stop');
        return;
      }
      const { ctx } = this;
      const res = await ctx.service.lagou.remoteList(currentPage, '成都', 'web前端');
      if (res.list.length && res.list.length === 15) {
        await this.findAndUpadte(res.list);
      } else {
        console.log('not enough 15!!!!!');
        notEnoughFlag = true;
      }
      await this.sleep(120000, 'remote');
      currentPage += 1;
      this.remote();
    } catch (err) {
      console.log(err);
      // await this.sleep(600000);
    }
  }
  /**
   * @param {array} arr - list
   */
  async findAndUpadte(arr) {
    const { ctx } = this;
    const client = await ctx.service.mongodb.client();
    for (let i = 0; i < 15; i++) {
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
