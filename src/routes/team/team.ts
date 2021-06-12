import {Express} from 'express';
import { Connection } from 'mysql';
import { query } from '../../config/mysql';
import Injector, {InjectedResources} from '../../injector/injector';
import fs from 'fs';
import path from 'path';
import { Knex } from 'knex';
type TeamEntry = {
    id: string,
    year: string,
    name: string,
    conference_id: string,
    conference_year: string,
}

const route = 'team';

const generateTeamRoutes = (expressApp: Express) => {
    let connection: Connection;

    Injector.requestInjection((resource: any) => {
        connection = resource;
    }, InjectedResources.CONNECTION)
    let queryBuilder: Knex;
    Injector.requestInjection((resource: any) => {
        queryBuilder = resource;
    }, InjectedResources.QUERY_BUILDER);

    expressApp.get(`/${route}`, async (req, res) => {
        let {
            skip = 0,
            take = 1,
            sortBy
        } = req.query;
        if (skip < 0) skip = 0;
        if (take < 0) skip = 0;
        console.log(sortBy);
        const count = query<{count: number}[]>(
            connection, 
            `select count(*) as count from teams`
        );

        const result = query<TeamEntry[]>(
            connection,
            `select * from teams ${sortBy ? `ORDER BY ${sortBy}` : ''} LIMIT ${skip},${take}`
        )

        const [
            countResult,
            dataResult
        ] = await Promise.all([count, result]);
        return res.send({
            data: dataResult,
            count: countResult[0].count,
        });
    });

    expressApp.post(`/${route}`, async (req, res) => {
        console.log('team post');
        const {
            year,
            id,
            name,
            conference_id,
            conference_year,
        } = req.body;
        const result = await query(
            connection,
            `INSERT INTO teams values ('${year}', 
            '${id}', 
            '${name}',
            '${conference_id}',
            '${conference_year}')`
        );
        res.sendStatus(200);
    });

    expressApp.get(`/${route}/test`, async (req,res) => {
        res.setHeader('content-type', 'text/html');
        res.render(path.resolve(__dirname,'public/testpost.ejs'), {
            route: 'team',
            sorts: ['name']
        })
    });
}

export default generateTeamRoutes;