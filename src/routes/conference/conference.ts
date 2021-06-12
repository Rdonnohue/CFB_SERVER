import {Express} from 'express';
import { Connection } from 'mysql';
import { query } from '../../config/mysql';
import Injector, {InjectedResources} from '../../injector/injector';
import path from 'path';
import { Knex } from 'knex';
type ConferenceEntry = {
    id: string,
    year: string,
    name: string,
}

const route = 'conference';

const generateConferenceRoutes = (expressApp: Express) => {
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
            searchString = '',
        } = req.query;
        const countQ = queryBuilder('conference')
        .count("* as count");
        
        if (searchString != '') {
            countQ.where('name', 'like', `%${searchString}%`);
        }

        const count = query<{count: number}[]>(
            connection, 
            countQ.toQuery().toString()
        );

        const conferenceQ = queryBuilder('conference')
        .select()
        
        if (sortBy != '') {
            conferenceQ.orderBy(sortBy as string, 'asc');
        }
        if (skip != null && take != null) {
            conferenceQ.offset(skip as number).limit(take as number);
        }

        if (searchString != '') {
            conferenceQ.where('name', 'like', `%${searchString}%`);
        }

        const result = query<ConferenceEntry[]>(
            connection,
            conferenceQ.toQuery().toString()
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
        const {
            year,
            id,
            name,
        } = req.body;
        const result = await query(
            connection,
            `INSERT INTO conference values ('${year}', '${id}', '${name}')`
        );
        res.sendStatus(200);
    });

    expressApp.get(`/${route}/test`, async (req,res) => {
        res.setHeader('content-type', 'text/html');
        res.render(path.resolve(__dirname,'public/testpost.ejs'), {
            route: 'conference',
            sorts: ['name']
        })
    });
}

export default generateConferenceRoutes;