'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/resources', controller.home.list);
  router.get('/resources/:positionId', controller.home.item);
  router.get('/map', controller.home.map);
  router.get('/monitor', controller.home.monitor);
  router.post('/zhipin/start', controller.zhipin.start);
  router.post('/zhipin/items/start', controller.zhipin.startItems);
  router.post('/zhipin/items/update', controller.zhipin.updateOlder);
  router.post('/zhipin/stop', controller.zhipin.stop);
  router.post('/lagou/start', controller.lagou.start);
  router.post('/lagou/stop', controller.lagou.stop);
  router.resources('adminResources', '/admin/resources', controller.admin.resources);
};
