const Subscription = require("egg").Subscription;
let currentPage, addCount, getCount;
/**
 * @var jobStatus
 * 0:被手动删除
 * 1:无详情
 * 2:有详情
 * 3:远程职位不存在
 * 4:远程职位停止招聘
 */

class ZhipinTask extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      immediate: false,
      type: "worker", // 指定所有的 worker 都需要执行
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
      const stopFlag = await ctx.service.lowdb.get("zhipin.stopFlag");
      if (stopFlag) {
        throw new Error("stop flag is true");
      }
      const { city, keyword, experience } = await ctx.service.lowdb.get(
        "zhipin.query"
      );
      const list = await ctx.service.zhipin.remoteList(currentPage, {
        city,
        keyword,
        experience,
      });
      if (list.length) {
        await this.findAndUpadte(list);
      } else if (list.length === 0) {
        console.log(
          `last page,no more data,this time got ${getCount} added ${addCount}！`
        );
        // 此处可以开始读取没有详情的jobDetail数据
        throw new Error("no more list data");
      }
    } catch (err) {
      ctx.logger.error(err.message);
      ctx.service.zhipin.stop();
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
      // const cityName = arr[0].cityName || null;
      let updatedCount = 0;
      for (let i = 0; i < totalCount; i++) {
        getCount++;
        const el = arr[i];
        const jobStatus =
          el.jobValidStatus === 1
            ? 1
            : el.jobValidStatus === 2
            ? 4
            : `0_${el.jobValidStatus}`;

        const findRes = await client.collection("jobs").findOneAndUpdate(
          { jobId: el.encryptJobId },
          {
            $set: {
              zhipin_cache_lid: el.lid,
              jobId: el.encryptJobId,
              remoteStatus: el.jobValidStatus,
              jobName: el.jobName,
              cityName: el.cityName,
              jobExperience: el.jobExperience,
              degreeName: el.jobDegree,
              salaryDesc: el.salaryDesc,
              companyShortName: el.brandName,
              companyLogo: el.brandLogo,
              jobFrom: "zhipin",
            },
            $currentDate: { update_time: true },
            $setOnInsert: {
              create_time: new Date(),
              jobStatus,
            },
          },
          {
            upsert: true,
            returnOriginal: false,
          }
        );
        if (findRes.lastErrorObject.updatedExisting) {
          updatedCount++;
        }
      }
      // 此处列表排序为乱序，不可做判断已存在数量
      // if (totalCount - updatedCount === 0) {
      //   console.log('database already existed all');
      //   ctx.service.zhipin.stop();
      // }
      console.log(
        `Updated Remote List: ${totalCount} | updated Data: ${updatedCount} | time: ${new Date()}`
      );
      await ctx.service.zhipin.sleep(1000, "Get Remote List wait");
      addCount = addCount + totalCount - updatedCount;
      currentPage += 1;
      this.remote();
      // this.taskInsert(new Date(), totalCount, cityName, keyword, updatedCount);
    } catch (err) {
      console.log(err);
      ctx.service.zhipin.stop();
    }
  }
  /**
   * @param {DateTime} create_time - 创建时间
   * @param {int} totalCount - 本页总数
   * @param {string} city - 城市
   * @param {string} keyword - 关键字
   * @param {string} updatedCount - 本次更新总数
   */
  // async taskInsert(create_time, totalCount, city, keyword, updatedCount) {
  //   const client = await this.ctx.service.mongodb.client();
  //   await client.collection("logs").insertOne({
  //     type: "zhipin",
  //     create_time,
  //     totalCount,
  //     city,
  //     keyword,
  //     updatedCount,
  //   });
  // }
}

module.exports = ZhipinTask;
