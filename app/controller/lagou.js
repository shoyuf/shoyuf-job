'use strict';

const Controller = require('egg').Controller;

class LagouController extends Controller {
  async start(ctx) {
    if (ctx.app.lagouCache.executedFlag === false) {
      ctx.app.lagouCache.executedFlag = true;
      // ctx.body = '已授权，正在执行中！';
      ctx.redirect('/monitor');
      await this.app.runSchedule('lagou.js');
    } else {
      ctx.status = 403;
      ctx.body = 'lagou is running';
    }
  }
  async startItems(ctx) {
    const session = ctx.request.body.session || null;
    if (ctx.app.lagouCache.executedFlag === false) {
      ctx.app.lagouCache.session = session;
      ctx.app.lagouCache.executedFlag = true;
      ctx.redirect('/monitor');
      await this.app.runSchedule('lagou-items.js');
    } else {
      ctx.status = 403;
      ctx.body = 'lagou is running';
    }
  }
  async updateOlder(ctx) {
    const session = ctx.request.body.session || null;
    if (ctx.app.lagouCache.executedFlag === false) {
      ctx.app.lagouCache.session = session;
      ctx.app.lagouCache.executedFlag = true;
      ctx.redirect('/monitor');
      await this.app.runSchedule('lagou-update-items.js');
    } else {
      ctx.status = 403;
      ctx.body = 'lagou is running';
    }
  }
  async stop(ctx) {
    console.log('stop Execute');
    ctx.app.lagouCache.executedFlag = false;
    ctx.redirect('/monitor');
    // ctx.body = '已停止';
  }
}

module.exports = LagouController;
