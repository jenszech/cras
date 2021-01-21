const pjson = require('../../package.json');
const config = require('config');
const { loggers } = require('winston');
const exchangeConnector = require('./exchangeConnector');

const logger = loggers.get('appLogger');
const myconfig = config.get('cras');

exports.init = function () {
  logger.info('CRAS v' + pjson.version + ' (' + myconfig.mainSetting.env + ')');
  logger.debug('=> Logging (Debug enabled)');

  const map = require('./model/usersMap');

  exchangeConnector.InitExchangeConnector();

  logger.info('Init completed');
};
