import IDatabaseQueryCollection from "./IDatabaseQueryCollection";
import { IPostQueries } from "./queries/postqueries";
import { ISessionQueries } from "./queries/sessionqueries";
import { IUserAssetsQueries } from "./queries/userassetsqueries";
import { IUserMetaQueries } from "./queries/usermetaqueries";
import { IUserQueries } from "./queries/userqueries";
import { IUtilsQueries } from "./queries/utilsqueries";

type DatabaseQueryCollectionType = IDatabaseQueryCollection;

class DatabaseQueries {
    readonly AllQueries: Array<IDatabaseQueryCollection>;
    readonly QueryListDictionary: Map<DatabaseQueryCollectionType, IDatabaseQueryCollection>;

    readonly UserQueries: IUserQueries;
    readonly UserMetaQueries: IUserMetaQueries;
    readonly UserAssetsQueries: IUserAssetsQueries;
    readonly SessionQueries: ISessionQueries;
    readonly PostQueries: IPostQueries;
    readonly UtilsQueries: IUtilsQueries;

    constructor(queryList: Array<IDatabaseQueryCollection>) {
        this.AllQueries = queryList;

        for (let i = 0; i < this.AllQueries.length; i++) {
            const queryCollection = this.AllQueries[i];

            switch (queryCollection.Name) {
                case "UserQueries":
                    this.UserQueries = queryCollection as IUserQueries;
                    break;
                case "UserMetaQueries":
                    this.UserMetaQueries = queryCollection as IUserMetaQueries;
                    break;
                case "UserAssetsQueries":
                    this.UserAssetsQueries = queryCollection as IUserAssetsQueries;
                    break;
                case "SessionQueries":
                    this.SessionQueries = queryCollection as ISessionQueries;
                    break;
                case "PostQueries":
                    this.PostQueries = queryCollection as IPostQueries;
                    break;
                case "UtilsQueries":
                    this.UtilsQueries = queryCollection as IUtilsQueries;
                    break;
                default:
                    break;
            }
        }
    }

    async Initialize(): Promise<void> {
        for (const query of this.AllQueries) {
            await query.Initialize();
        }

        return Promise.resolve();
    }
}

export default DatabaseQueries;