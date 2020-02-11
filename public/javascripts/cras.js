const pjson = require('../../package.json');
const config = require('config');
const { loggers } = require('winston');
let exchangeConnector = require('./exchangeConnector');

const logger = loggers.get('appLogger');

let myconfig = config.get('cras');

exports.init = function() {
    logger.info("CRAS v"+pjson.version + ' ('+myconfig.mainSetting.env+')');
    logger.debug('=> Logging (Debug enabled)');

    exchangeConnector.InitExchangeConnector();

    logger.info('Init completed');
};



