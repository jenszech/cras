"use strict"

const pjson = require('../../package.json');
const config = require('config');
const { loggers } = require('winston')

const logger = loggers.get('appLogger');

var myconfig = config.get('cras.mainSetting');

exports.init = function() {
    logger.info("CRAS v"+pjson.version + ' ('+myconfig.env+')');
    logger.info('Init');
    logger.debug('=> Logging (Debug enabled)');


    logger.info('Init completed');
}



