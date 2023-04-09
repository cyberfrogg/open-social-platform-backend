import IDatabaseQueryCollection from "./IDatabaseQueryCollection";
import { ISessionQueries } from "./queries/sessionqueries";
import { IUserMetaQueries } from "./queries/usermetaqueries";
import { IUserQueries } from "./queries/userqueries";

type DatabaseQueryCollectionType = IDatabaseQueryCollection;

class DatabaseQueries {
    readonly AllQueries: Array<IDatabaseQueryCollection>;
    readonly QueryListDictionary: Map<DatabaseQueryCollectionType, IDatabaseQueryCollection>;

    readonly UserQueries: IUserQueries;
    readonly UserMetaQueries: IUserMetaQueries;
    readonly SessionQueries: ISessionQueries;

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
                case "SessionQueries":
                    this.SessionQueries = queryCollection as ISessionQueries;
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