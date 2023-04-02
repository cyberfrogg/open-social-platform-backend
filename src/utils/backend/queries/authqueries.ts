import IDatabaseQueryCollection from "../IDatabaseQueryCollection";

interface IAuthQueries extends IDatabaseQueryCollection {
    Initialize(): Promise<void>;
}

class AuthQueries implements IAuthQueries {
    readonly Name: string = "AuthQueries";

    Initialize(): Promise<void> {
        return Promise.resolve();
    }
}

export { IAuthQueries, AuthQueries };