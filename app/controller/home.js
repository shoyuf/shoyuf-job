'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async list(ctx) {
    const list = await ctx.service.home.list(1);
    ctx.body = { list, pageInfo: list.pageInfo };
  }
  async item(ctx) {
    const positionId = isNaN(Number(ctx.params.positionId, 10)) ? ctx.params.positionId : Number(ctx.params.positionId, 10);
    if (positionId) {
      const item = await ctx.service.home.item(positionId);
      ctx.body = item;
    } else {
      ctx.body = 'error params';
    }
  }
  async map(ctx) {
    await ctx.render('map.tpl');
  }
}

module.exports = HomeController;
