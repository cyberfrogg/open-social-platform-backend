import { Express } from 'express';

interface IRoute {
    path: string;
    Initialize(expressApp: Express): Promise<void>;
}

export default IRoute;