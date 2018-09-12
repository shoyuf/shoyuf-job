'use strict';

const Controller = require('egg').Controller;

class LagouController extends Controller {
  async start(ctx) {
    if (ctx.app.lagouCache.executedFlag === false) {
      ctx.app.lagouCache.executedFlag = true;
      ctx.body = '已授权，正在执行中！';
      await this.app.runSchedule('lagou.js');
    } else {
      ctx.status = 400;
      ctx.body = 'lagou is running';
    }
  }
  async stop(ctx) {
    console.log('stop Execute');
    ctx.app.lagouCache.executedFlag = false;
    ctx.body = '已停止';
  }
}

module.exports = LagouController;
