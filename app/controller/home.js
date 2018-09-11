'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async list(ctx) {
    const list = await ctx.service.home.list(1);
    ctx.body = { list, pageInfo: list.pageInfo };
  }
  async map(ctx) {
    await ctx.render('map.tpl');
  }
}

module.exports = HomeController;
