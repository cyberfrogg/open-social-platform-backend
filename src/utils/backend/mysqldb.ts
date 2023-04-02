import mysql from "serverless-mysql";

// Create a MySQL instance
const db = mysql({
    config: {
        host: process.env.DB_ADDRESS,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
    },
});

export async function excuteQuery({ query, values }: any) {
    try {
        const results = await db.query(query, values);
        await db.end();
        return results;
    } catch (error) {
        return { error };
    }
}

export function executeTransaction() {
    return db.transaction();
}