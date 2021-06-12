import {ConnectionConfig} from 'mysql';
const config = require('../../config.json');
export const mysqlConfig: ConnectionConfig = {
    ...config,
}

