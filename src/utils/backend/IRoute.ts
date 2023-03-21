import { Express } from 'express';

interface IRoute {
    Initialize(expressApp: Express): Promise<void>;
}

export default IRoute;