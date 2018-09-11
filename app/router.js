'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/resources', controller.home.list);
  router.get('/resources/:positionId', controller.home.item);
  router.get('/map', controller.home.map);
  router.get('/zhipin', controller.zhipin.view);
  router.post('/zhipin/start', controller.zhipin.start);
  router.post('/zhipin/stop', controller.zhipin.stop);
};
