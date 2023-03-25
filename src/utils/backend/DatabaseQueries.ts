import IDatabaseQueryCollection from "./IDatabaseQueryCollection";
import { AuthQueries, IAuthQueries } from "./queries/authqueries";
import { IUserQueries, UserQueries } from "./queries/userqueries";

type DatabaseQueryCollectionType = IDatabaseQueryCollection;

class DatabaseQueries {
    readonly AllQueries: Array<IDatabaseQueryCollection>;
    readonly QueryListDictionary: Map<DatabaseQueryCollectionType, IDatabaseQueryCollection>;

    readonly UserQueries: IUserQueries;
    readonly AuthQueries: IAuthQueries;

    constructor(queryList: Array<IDatabaseQueryCollection>) {
        this.AllQueries = queryList;

        for (let i = 0; i < this.AllQueries.length; i++) {
            const queryCollection = this.AllQueries[i];

            switch (queryCollection.Name) {
                case "UserQueries":
                    this.UserQueries = queryCollection as IUserQueries;
                    break;
                case "AuthQueries":
                    this.AuthQueries = queryCollection as IAuthQueries;
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