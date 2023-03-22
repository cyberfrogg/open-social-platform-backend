import express from 'express';
require('dotenv').config({ path: '.env' });

import Ping from './routes/api/v1/ping';

const app = express();
app.use(express.json());

const InitializeApp = async () => {
    // instantiate routes
    let routes = new Array<Ping>();
    routes.push(new Ping("/api/v1/ping"));

    // initialize routes
    for (const route of routes) {
        await route.Initialize(app);
    }

    const appPort = process.env.PORT
    app.listen(appPort, () => {
        return console.log(`Auth Service is listening at port ${appPort}`);
    });
};

InitializeApp();