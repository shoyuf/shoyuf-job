const Controller = require("egg").Controller;

class ResourcesController extends Controller {
  async index(ctx) {
    await ctx.render("admin/list.tpl");
  }
}

module.exports = ResourcesController;
