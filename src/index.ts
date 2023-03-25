import express from 'express';
require('dotenv').config({ path: '.env' });

import Ping from './routes/api/v1/ping';
import UserRegister from './routes/api/v1/user/auth/register';

import DatabaseQueries from './utils/backend/DatabaseQueries';
import IDatabaseQueryCollection from './utils/backend/IDatabaseQueryCollection';
import { IUserQueries, UserQueries } from './utils/backend/queries/userqueries';

const app = express();
app.use(express.json());


const InitializeApp = async () => {
    // instantiate database queries
    let databaseQueriesList = new Array<IDatabaseQueryCollection>();
    databaseQueriesList.push(new UserQueries())

    let databaseQueries = new DatabaseQueries(databaseQueriesList);
    await databaseQueries.Initialize();


    // instantiate routes
    let routes = new Array<Ping>();
    routes.push(new Ping("/api/v1/ping"));
    routes.push(new UserRegister("/api/v1/user/auth/register", databaseQueries));


    // initialize routes
    for (const route of routes) {
        await route.Initialize(app);
        console.log(`\x1b[32mInitialized ${route.path} route \x1b[0m'`);
    }

    // start service
    const appPort = process.env.PORT
    app.listen(appPort, () => {
        return console.log(`Auth Service is listening at port ${appPort}`);
    });
};

console.log("\n \x1b[34m --- APP START --- \x1b[0m")
InitializeApp();