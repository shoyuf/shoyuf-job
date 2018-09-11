'use strict';

const Service = require('egg').Service;

class HomeService extends Service {
  async list(currentPage = 1) {
    const { ctx } = this;
    const pageSize = 9999;
    const client = await ctx.service.mongodb.client();
    const skip = currentPage === 1 ? 0 : pageSize * (currentPage - 1);
    // const filter = status === 1 ? { status: 1 } : {};
    const filter = {};
    const res = await client.collection('jobs').find(filter, {
      projection: {
        positionId: 1,
        latitude: 1,
        longitude: 1,
        jobFrom: 1,
      },
      limit: pageSize, skip,
      sort: {
        createTime: -1,
      },
    }).toArray();
    // const maxPage = Math.ceil(await client.collection('jobs').find(filter).count() / pageSize);
    const maxPage = 1;
    return Object.assign(res, { pageInfo: { maxPage, currentPage: parseInt(currentPage, 10) } });
  }
  async item(positionId) {
    const client = await this.ctx.service.mongodb.client();
    const res = await client.collection('jobs').findOne({
      positionId,
    });
    return res;
  }
}

module.exports = HomeService;
