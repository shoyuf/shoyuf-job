const Subscription = require("egg").Subscription;
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
      type: "worker", // 指定所有的 worker 都需要执行
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
      // 寻找一个最近的
      const recentDay = await client.collection("jobs").findOne(
        {
          jobFrom: "lagou",
          jobStatus: 2, // 有详情
        },
        {
          sort: {
            update_time: -1,
          },
        }
      );
      // 获取最近的更新时间
      const _o = new Date(recentDay.update_time);
      // 获取年月日
      const d = new Date(_o.getFullYear(), _o.getMonth(), _o.getDate());
      // 统计年月日小于当天的
      thisCount = await client.collection("jobs").countDocuments({
        jobFrom: "lagou",
        jobStatus: 2, // 有详情
        remoteStatus: "ONLINE", // 远程状态正常
        update_time: { $lt: d },
      });
      if (recentDay) {
        console.log(`this update count is ${thisCount} // ${d}`);
        this.findAndUpdateDetail(d);
      } else {
        console.log("no one item!");
        ctx.service.lagou.stop();
      }
    } catch (err) {
      console.log(err);
      ctx.service.lagou.stop();
    }
  }
  async findAndUpdateDetail(recentDay) {
    const { ctx } = this;
    try {
      if (ctx.app.lagouCache.executedFlag === false) {
        console.log("stopFlag");
        return;
      }
      const client = await ctx.service.mongodb.client();
      // find a lateset item 上一次更新列表中在列表里面的

      const findOneRes = await client.collection("jobs").findOne(
        {
          jobFrom: "lagou",
          jobStatus: 2, // 有详情
          remoteStatus: "ONLINE", // 远程状态正常
          update_time: { $lt: new Date(recentDay) },
        },
        {
          sort: {
            update_time: 1,
          },
        }
      );
      if (findOneRes) {
        const remoteDetailRes = await ctx.service.lagou.remoteDetail(
          findOneRes.jobId
        );
        if (remoteDetailRes.item) {
          const d = remoteDetailRes.item;
          const jobStatus =
            d.status === "ONLINE"
              ? 2
              : d.status === "EXPIRED"
              ? 4
              : d.status === "DELETED"
              ? 3
              : `0_${d.status}`;
          await client.collection("jobs").updateOne(
            { jobId: findOneRes.jobId },
            {
              $set: {
                remoteStatus: d.status, // list aboved
                companyApprove: d.companyApprove,
                jobStatus,
              },
              $currentDate: { update_time: true },
            },
            {
              upsert: false,
            }
          );
          if (d.status !== findOneRes.remoteStatus) changeCount++;
          countNum++;
          timeoutCount = 0;
          console.log(
            `[${countNum}/${thisCount} | ${changeCount} 😷 ]updated Older Detail: ${findOneRes.companyShortName} | ${findOneRes.jobId} | ${findOneRes.remoteStatus} -> ${d.status}`
          );
          await ctx.service.lagou.sleep(5000, "Get Older Item Wait");
          this.findAndUpdateDetail(recentDay);
        } else if (timeoutCount < 2) {
          timeoutCount++;
          this.findAndUpdateDetail(recentDay);
        } else {
          console.log(remoteDetailRes.msg);
          ctx.service.lagou.stop();
        }
      } else {
        console.log("no more older item!!! stop");
        ctx.service.lagou.stop();
      }
    } catch (err) {
      console.log(err);
      ctx.service.lagou.stop();
    }
  }
}

module.exports = ZhipinItemsTask;
