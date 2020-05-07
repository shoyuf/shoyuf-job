const Controller = require("egg").Controller;

class ZhipinController extends Controller {
  async condition(ctx) {
    try {
      const { service } = ctx;
      const localCondition = await service.lowdb.get("zhipin.condition");
      if (!localCondition) {
        const condition = await service.zhipin.condition();
        await service.lowdb.set("zhipin.condition", condition);
      }
      ctx.redirect("/monitor");
    } catch (error) {
      ctx.logger.error(error.message);
      ctx.body = error.message;
    }
  }
  async start(ctx) {
    try {
      const { service, app } = ctx;
      const executed = await service.lowdb.get("zhipin.executed");
      if (executed) {
        ctx.body = "zhipin has been executed";
        return;
      }
      service.lowdb.set("zhipin.query.city", ctx.request.body.city);
      service.lowdb.set("zhipin.query.keyword", ctx.request.body.keyword);
      service.lowdb.set(
        "zhipin.query.experience",
        ctx.request.body.experience || []
      );
      await service.lowdb.set("zhipin.executed", true);
      ctx.redirect("/monitor");
      await app.runSchedule("zhipin.js");
    } catch (error) {
      ctx.logger.error(error.message);
      ctx.body = error.message;
    }
  }
  async startItems(ctx) {
    try {
      const { service, app } = ctx;
      const executed = await service.lowdb.get("zhipin.executed");
      if (executed) {
        ctx.body = "zhipin has been executed";
        return;
      }
      await service.lowdb.set("zhipin.executed", true);
      ctx.redirect("/monitor");
      await app.runSchedule("zhipin-items.js");
    } catch (error) {
      ctx.logger.error(error.message);
      ctx.body = error.message;
    }
    // const session = ctx.request.body.session || null;
    // const testRes = await ctx.service.zhipin.test(session);
    // if (testRes === true && ctx.app.zhipinCache.executedFlag === false) {
    //   ctx.app.zhipinCache.session = session;
    //   ctx.app.zhipinCache.executedFlag = true;
    //   ctx.redirect("/monitor");
    //   await this.app.runSchedule("zhipin-items.js");
    // } else {
    //   ctx.status = 403;
    //   ctx.body = testRes || "please input session";
    // }
  }
  async updateOlder(ctx) {
    const session = ctx.request.body.session || null;
    const testRes = await ctx.service.zhipin.test(session);
    if (testRes === true && ctx.app.zhipinCache.executedFlag === false) {
      ctx.app.zhipinCache.session = session;
      ctx.app.zhipinCache.executedFlag = true;
      ctx.redirect("/monitor");
      await this.app.runSchedule("zhipin-update-items.js");
    } else {
      ctx.status = 403;
      ctx.body = testRes || "please input session";
    }
  }
  async stop(ctx) {
    ctx.logger.info("stop Execute");
    await ctx.service.lowdb.set("zhipin.stopFlag", true);
    await ctx.service.lowdb.set("zhipin.executed", false);
    ctx.redirect("/monitor");
  }
}

module.exports = ZhipinController;
