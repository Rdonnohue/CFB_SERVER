import { Knex } from 'knex';
import {Connection} from 'mysql'
export enum InjectedResources {
    CONNECTION="connection", //mysql connection
    QUERY_BUILDER="QR", //knex proxy
}
class Injector {
    static connection: Connection;
    static queryBuilder: Knex
    static requests: {callback: any, type: InjectedResources}[] = [];
    static requestInjection = (callback: any, type: InjectedResources) => {
        Injector.requests.push({
            callback,
            type,
        });
    };
    static hydrateInjections = () => {
        Injector.requests.forEach(({callback, type}) => {
            if (type === InjectedResources.CONNECTION) {
                if (!Injector.connection) {
                    throw new Error('Connection not set');
                }
                callback(Injector.connection);
            }
            if (type === InjectedResources.QUERY_BUILDER) {
                if (!Injector.queryBuilder) {
                    throw new Error("QB not set");
                }
                callback(Injector.queryBuilder);
            }
        })
    }
}

export default Injector;