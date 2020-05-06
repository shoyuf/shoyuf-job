module.exports = () => {
  return async function session(ctx, next) {
    const path = ctx.request.path;
    if (path.includes("zhipin")) {
      const mpt = ctx.request.body.mpt;
      const wt = ctx.request.body.wt;
      if (!mpt || !wt) throw new Error("not found session(mpt, wt)");
      await ctx.service.lowdb.set("zhipin.query.mpt", mpt);
      await ctx.service.lowdb.set("zhipin.query.wt", wt);
    }
    if (path.includes("lagou")) {
      await ctx.service.lowdb.set("lagou.session", session);
      // throw new Error("not found session");
    }
    await next();
  };
};
