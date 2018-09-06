[![SHOYUF-JOB](./logo.png)](https://github.com/shoyuf/shoyuf-job)

![platform](https://img.shields.io/badge/platform-Web-blue.svg)

## SHOYUF-JOB

一个基于 Egg (Koa2) 开发的职位爬虫

### 平台支持

| 拉勾Lagou | Boss直聘 |
| - | - |
| ✔ | ✍ |

### 功能完整程度

- [x] 基础爬取功能
- [x] 地图展示
- [x] 定时任务
- [x] 数据库字段文档
- [ ] 配置文件
- [ ] 其他招聘网站
- [ ] 单元测试
- [ ] 代码部署
- [ ] 优化代码

### 界面

![screenshot](./screenshot.png)

### 使用调试

`Node.js` 版本大于 `8.11.x` ，建议使用 `Yarn`

执行 `yarn dev`

### 常见问题

- 如何查找其他职位和其他城市信息

  *在 `app/schedule/lagou.js` 中修改相关字段，如 `成都` 或 `web前端`*

- 如何配置数据库
  
  *本项目默认使用 `MongoDB` 存储，需要在 `config` 目录下建立 `secret_config.js` 文件，并输入如下数据，如有其他适配（如数据库验证）还需修改 `app/service/mongodb.js` 的内容*

### 鸣谢

- [Egg](https://eggjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [axios](https://github.com/axios/axios)

### License

MIT
