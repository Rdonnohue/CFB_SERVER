import {Express} from 'express';
import { Connection } from 'mysql';
import { query } from '../../config/mysql';
import Injector, {InjectedResources} from '../../injector/injector';
import fs from 'fs';
import path from 'path';
import {escape} from 'mysql';
import { Knex } from 'knex';
type TeamEntry = {
    id: string,
    year: string,
    name: string,
    conference_id: string,
    conference_year: string,
}

const route = 'player';

const generatePlayerRoutes = (expressApp: Express) => {
    let connection: Connection;

    Injector.requestInjection((resource: any) => {
        connection = resource;
    }, InjectedResources.CONNECTION)
    let queryBuilder: Knex;
    Injector.requestInjection((resource: any) => {
        queryBuilder = resource;
    }, InjectedResources.QUERY_BUILDER);

    expressApp.get(`/${route}`, async (req, res) => {
        const {
            skip = 0,
            take = 1,
            sortBy = '',
        } = req.query;
        
        const countQ = queryBuilder('players')
        .select()
        .count('* as count')
        .toString()
        const count = query<{count: number}[]>(
            connection, 
            countQ,
        );
        const playerQ = queryBuilder('players')
        .select()
        if (sortBy !== '') {
            playerQ.orderBy(sortBy as string);
        }
        if (skip != null && take != null) {
            playerQ.offset(skip as number).limit(take as number);
        }
        const result = query<TeamEntry[]>(
            connection,
            playerQ.toString()
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
            id,
            year,
            name,
            team_year,
            team_id,
        } = req.body;
        const result = await query(
            connection,
            `INSERT INTO players values ('${id}', 
            '${year}', 
            ${escape(name)},
            '${team_year}',
            '${team_id}')`
        );
        res.sendStatus(200);
    });

    expressApp.get(`/${route}/test`, async (req,res) => {
        res.setHeader('content-type', 'text/html');
        res.render(path.resolve(__dirname,'public/testpost.ejs'), {
            route: 'player',
            sorts: ['name']
        })
    });
}

export default generatePlayerRoutes;