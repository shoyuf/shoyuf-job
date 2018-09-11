'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async view(ctx) {
    await ctx.render('zhipin/view.tpl', { executedFlag: ctx.app.zhipinCache.executedFlag });
  }
  async start(ctx) {
    const session = ctx.request.body.session || null;
    const testRes = await ctx.service.zhipin.test(session);
    if (testRes === true && ctx.app.zhipinCache.executedFlag === false) {
      ctx.app.zhipinCache.session = session;
      ctx.app.zhipinCache.executedFlag = true;
      ctx.body = '已授权，正在执行中！';
      await this.app.runSchedule('zhipin.js');
    } else {
      ctx.body = testRes || 'please input session';
    }
  }
  async stop(ctx) {
    console.log('stop Execute');
    ctx.app.zhipinCache.executedFlag = false;
    ctx.body = '已停止';
  }
}

module.exports = HomeController;
