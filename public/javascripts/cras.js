const pjson = require('../../package.json');
const config = require('config');
const { loggers } = require('winston')

const logger = loggers.get('appLogger');

var myconfig = config.get('cras');

exports.init = function() {
    logger.info("CRAS v"+pjson.version + ' ('+myconfig.mainSetting.env+')');
    logger.debug('=> Logging (Debug enabled)');

    //Do some init stuff

    logger.info('Init completed');
}



