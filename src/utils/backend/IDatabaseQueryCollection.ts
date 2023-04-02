interface IDatabaseQueryCollection {
    Name: string;
    Initialize(): Promise<void>;
}

export default IDatabaseQueryCollection;