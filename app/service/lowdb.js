const path = require("path");
const Service = require("egg").Service;

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync(path.resolve(__dirname, "../../db/db.json"));
const db = low(adapter);
// Set some defaults (required if your JSON file is empty)
const hotCityList = require("../../const/hot-city-list");
db.defaults({
  zhipin: {
    condition: {
      hotCityList,
    },
  },
  lagou: {},
}).write();

class LowdbService extends Service {
  async db() {
    return db;
  }
  async get(key) {
    return db.get(key).value();
  }
  async set(key, value) {
    return db.set(key, value).write();
  }
  async join(key, value) {
    
  }
}

module.exports = LowdbService;
