const Service = require("egg").Service;
const ObjectId = require("mongodb").ObjectId;
class HomeService extends Service {
  async list(currentPage = 1, querys) {
    const { ctx } = this;
    const { projectionAll } = querys;
    const pageSize = 2000;
    const client = await ctx.service.mongodb.client();
    const skip = currentPage === 1 ? 0 : pageSize * (currentPage - 1);
    // const filter = status === 1 ? { status: 1 } : {};
    const filter = { jobStatus: 2 };
    const res = await client
      .collection("jobs")
      .find(filter, {
        projection: projectionAll
          ? {
              zhipin_cache_lid: false,
              companyId: false,
              expectId: false,
              hrId: false,
              companyApprove: false,
            }
          : {
              salary_max: true,
              jobExperience: true,
              longitude: true,
              latitude: true,
              jobId: true,
              companyShortName: true,
              jobFrom: true,
            },
        limit: pageSize,
        skip,
        sort: {
          create_time: 1,
        },
      })
      .toArray();
    // const maxPage = Math.ceil(await client.collection('jobs').find(filter).count() / pageSize);
    const maxPage = 1;
    const jobExperience = await client
      .collection("jobs")
      .aggregate([{ $group: { _id: "$jobExperience" } }])
      .toArray();
    const companySize = await client
      .collection("jobs")
      .aggregate([{ $group: { _id: "$companySize" } }])
      .toArray();
    return Object.assign(res, {
      pageInfo: { maxPage, currentPage: parseInt(currentPage, 10) },
      filters: { jobExperience, companySize },
    });
  }
  async item(_id) {
    const client = await this.ctx.service.mongodb.client();
    const res = await client.collection("jobs").findOne({
      _id: ObjectId(_id),
    });
    return res;
  }
}

module.exports = HomeService;
