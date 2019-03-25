'use strict';

const Service = require('egg').Service;
const ObjectId = require('mongodb').ObjectId;
class HomeService extends Service {
  async list(currentPage = 1, querys) {
    const { ctx } = this;
    const { projectionAll } = querys;
    const pageSize = 999;
    const client = await ctx.service.mongodb.client();
    const skip = currentPage === 1 ? 0 : pageSize * (currentPage - 1);
    // const filter = status === 1 ? { status: 1 } : {};
    const filter = { jobStatus: 2 };
    const res = await client.collection('jobs').find(filter, {
      projection: projectionAll ? { } : {
        salary_max: 1,
        jobExperience: 1,
        longitude: 1,
        latitude: 1,
        jobId: 1,
        companyShortName: 1,
        jobFrom: 1,
      },
      limit: pageSize, skip,
      sort: {
        create_time: 1,
      },
    }).toArray();
    // const maxPage = Math.ceil(await client.collection('jobs').find(filter).count() / pageSize);
    const maxPage = 1;
    const jobExperience = await client.collection('jobs').aggregate([{ $group: { _id: '$jobExperience' } }]).toArray();
    const companySize = await client.collection('jobs').aggregate([{ $group: { _id: '$companySize' } }]).toArray();
    return Object.assign(res, {
      pageInfo: { maxPage, currentPage: parseInt(currentPage, 10) },
      filters: { jobExperience, companySize },
    });
  }
  async item(_id) {
    const client = await this.ctx.service.mongodb.client();
    const res = await client.collection('jobs').findOne({
      _id: ObjectId(_id),
    });
    return res;
  }
}

module.exports = HomeService;
