import mysql, { Query } from 'mysql';
import { mysqlConfig } from './config';

type QueryFunc<T> =(connection: mysql.Connection, query: string) => Promise<T>

export const connect = async () => {
    const connection = mysql.createConnection(mysqlConfig)
    await connection.connect();
    return connection;
}

export const query= <T>(connection: mysql.Connection, query: string) => {
    return new Promise((resolve) => {
        connection.query(query, connection, (error, result) => {
            resolve(result);
        })
    }) as Promise<T>
};

