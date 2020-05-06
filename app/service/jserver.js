const Service = require("egg").Service;

const HOST_PREFIX = "http://127.0.0.1:3000";

class JserverService extends Service {
  async find(key) {
    const { ctx } = this;
    return (
      await ctx.curl(`${HOST_PREFIX}/${key}`, {
        dataType: "json",
      })
    ).data;
  }
  async save(key, data) {
    const { ctx } = this;
    return await ctx.curl(`${HOST_PREFIX}/${key}`, {
      method: "POST",
      dataType: "json",
      data,
    });
  }
}

module.exports = JserverService;
