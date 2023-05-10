import express from 'express';
require('dotenv').config({ path: '.env' });
const cors = require('cors');

import Ping from './routes/api/v1/ping';
import UserRegister from './routes/api/v1/user/auth/register';

import DatabaseQueries from './utils/backend/DatabaseQueries';
import IDatabaseQueryCollection from './utils/backend/IDatabaseQueryCollection';
import { IUserQueries, UserQueries } from './utils/backend/queries/userqueries';
import { UserMetaQueries } from './utils/backend/queries/usermetaqueries';
import { SessionQueries } from './utils/backend/queries/sessionqueries';
import UserVerifyEmail from './routes/api/v1/user/auth/verifyemail';
import UserLogin from './routes/api/v1/user/auth/login';
import UserResetPasswordStart from './routes/api/v1/user/auth/resetpasswordstart';
import UserResetPasswordComplete from './routes/api/v1/user/auth/resetpasswordcomplete';
import ReqResponse from './data/shared/reqResponse';
import UserGetNickname from './routes/api/v1/user/getnickname';
import UserGetByNickname from './routes/api/v1/user/getbynickname';
import IRoute from './utils/backend/IRoute';
import PostCreate from './routes/api/v1/post/create';
import { PostQueries } from './utils/backend/queries/postqueries';
import PostGetById from './routes/api/v1/post/getpostbyid';

const app = express();
app.use(express.json());
app.use(cors({
    origin: process.env.WEBSITE_CORS_URL
}));


const InitializeApp = async () => {
    // instantiate database queries
    let databaseQueriesList = new Array<IDatabaseQueryCollection>();
    databaseQueriesList.push(new UserQueries());
    databaseQueriesList.push(new UserMetaQueries());
    databaseQueriesList.push(new SessionQueries());
    databaseQueriesList.push(new PostQueries());

    let databaseQueries = new DatabaseQueries(databaseQueriesList);
    await databaseQueries.Initialize();


    // instantiate routes
    let routes = new Array<IRoute>();
    routes.push(new Ping("/api/v1/ping"));

    routes.push(new UserRegister("/api/v1/user/auth/register", databaseQueries));
    routes.push(new UserVerifyEmail("/api/v1/user/auth/verifyemail", databaseQueries));
    routes.push(new UserLogin("/api/v1/user/auth/login", databaseQueries));
    routes.push(new UserResetPasswordStart("/api/v1/user/auth/resetpasswordstart", databaseQueries));
    routes.push(new UserResetPasswordComplete("/api/v1/user/auth/resetpasswordcomplete", databaseQueries));
    routes.push(new UserGetNickname("/api/v1/user/getnickname", databaseQueries));
    routes.push(new UserGetByNickname("/api/v1/user/getuserbynickname", databaseQueries));

    routes.push(new PostCreate("/api/v1/post/create", databaseQueries));
    routes.push(new PostGetById("/api/v1/post/getbyid", databaseQueries));


    // initialize routes
    for (const route of routes) {
        await route.Initialize(app);
        console.log(`\x1b[32mInitialized ${route.path} route \x1b[0m'`);
    }

    // handle all other errors
    app.use((err, req, res, next) => {
        if (err instanceof SyntaxError && 'body' in err) {
            console.error(err);
            return res.json(new ReqResponse(false, "ERRCODE_UNKNOWN", null));
        }
        next();
    });

    // start service
    const appPort = process.env.PORT
    app.listen(appPort, () => {
        return console.log(`Backend is listening at port ${appPort}`);
    });
};

console.log("\n \x1b[34m --- APP START --- \x1b[0m")
InitializeApp();