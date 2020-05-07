const Controller = require("egg").Controller;

class HomeController extends Controller {
  async list(ctx) {
    const res = await ctx.service.home.list(1, ctx.query);
    ctx.body = { list: res, pageInfo: res.pageInfo, filters: res.filters };
  }
  async item(ctx) {
    const positionId = isNaN(Number(ctx.params.positionId, 10))
      ? ctx.params.positionId
      : Number(ctx.params.positionId, 10);
    if (positionId) {
      const item = await ctx.service.home.item(positionId);
      ctx.body = item;
    } else {
      ctx.body = "error params";
    }
  }
  async map(ctx) {
    await ctx.render("map.tpl");
  }
  async monitor(ctx) {
    const zhipin = await ctx.service.lowdb.get("zhipin");
    // const lagouCache = await service.jserver.find("lagou");
    const zhipinExperience = zhipin.condition.experienceList.map((el) => {
      el.checked = zhipin.query.experience.includes(el.code.toString());
      return el;
    });
    await ctx.render("monitor.tpl", {
      zhipin,
      zhipinExperience,
      // lagouStatus: lagouCache.executedFlag,
    });
  }
}

module.exports = HomeController;
