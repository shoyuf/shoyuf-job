'use strict';
const chalk = require('chalk');

module.exports = () => {
  return async function logger(ctx, next) {
    await next();
    console.log(`    IP:${chalk.blue(ctx.request.ip)}  ==>  Path:${chalk.green(ctx.request.path)}  Response:${chalk.magenta(ctx.response.status)}`);
  };
};
