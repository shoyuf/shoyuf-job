'use strict';

const Controller = require('egg').Controller;

class ZhipinController extends Controller {
  async start(ctx) {
    const session = ctx.request.body.session || null;
    const testRes = await ctx.service.zhipin.test(session);
    if (testRes === true && ctx.app.zhipinCache.executedFlag === false) {
      ctx.app.zhipinCache.session = session;
      ctx.app.zhipinCache.executedFlag = true;
      ctx.redirect('/monitor');
      await this.app.runSchedule('zhipin.js');
    } else {
      ctx.status = 403;
      ctx.body = testRes || 'please input session';
    }
  }
  async startItems(ctx) {
    const session = ctx.request.body.session || null;
    const testRes = await ctx.service.zhipin.test(session);
    if (testRes === true && ctx.app.zhipinCache.executedFlag === false) {
      ctx.app.zhipinCache.session = session;
      ctx.app.zhipinCache.executedFlag = true;
      ctx.redirect('/monitor');
      await this.app.runSchedule('zhipin-items.js');
    } else {
      ctx.status = 403;
      ctx.body = testRes || 'please input session';
    }
  }
  async updateOlder(ctx) {
    const session = ctx.request.body.session || null;
    const testRes = await ctx.service.zhipin.test(session);
    if (testRes === true && ctx.app.zhipinCache.executedFlag === false) {
      ctx.app.zhipinCache.session = session;
      ctx.app.zhipinCache.executedFlag = true;
      ctx.redirect('/monitor');
      await this.app.runSchedule('zhipin-update-items.js');
    } else {
      ctx.status = 403;
      ctx.body = testRes || 'please input session';
    }
  }
  async stop(ctx) {
    console.log('stop Execute');
    ctx.app.zhipinCache.executedFlag = false;
    ctx.redirect('/monitor');
    // ctx.body = '已停止';
  }
}

module.exports = ZhipinController;
