const secretConfig = require("./secret_config.js");

module.exports = (appInfo) => {
  return {
    // use for cookie sign key, should change to your own and keep security
    keys: appInfo.name + secretConfig.cookieKeyStr,
    view: {
      defaultViewEngine: "nunjucks",
      mapping: {
        ".tpl": "nunjucks",
      },
    },
    // add your config here
    middleware: [],
    database: secretConfig.database,
    httpclient: {
      request: {
        timeout: 20000,
      },
    },
  };
};
