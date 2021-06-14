import express from 'express';
import { connect, query } from './config/mysql';
import Injector from './injector/injector';
import generateConferenceRoutes from './routes/conference/conference';
import generatePlayerRoutes from './routes/player/player';
import generateTeamRoutes from './routes/team/team';
const PORT = process.env.PORT_NUM;
// keeps it from being tree-shaken
const ejs = require("ejs").__express;
const app = express();
connect().then((connection) => {
    app.use(express.json());
    app.set('view engine', 'ejs');
    // tree shaking
    app.engine('.ejs', ejs);

    const knex = require('knex')({
        client: "mysql",
    });

    //apply routes to app
    generateConferenceRoutes(app);
    generateTeamRoutes(app);
    generatePlayerRoutes(app);
    // ghetto injector, should do the job though
    // pretty flexible too,
    Injector.connection = connection;
    Injector.queryBuilder = knex;
    Injector.hydrateInjections();
    app.listen(PORT, () => {
        console.log(`listening on port ${PORT}`)
    });
})
