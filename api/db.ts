import path from "path";

const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
const pgUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

let db: any;
let isPostgres = false;

async function getDb() {
    if (db) return db;

    if (isProduction && pgUrl) {
        const { default: pg } = await import("pg");
        db = new pg.Pool({
            connectionString: pgUrl,
            ssl: {
                rejectUnauthorized: false
            }
        });
        isPostgres = true;
        console.log("Using Postgres (Production)");
    } else {
        // @ts-ignore
        const { default: Database } = await import("better-sqlite3");
        db = new Database(path.join(process.cwd(), "vittahorta.db"));
        isPostgres = false;
        console.log("Using SQLite (Local)");
    }
    return db;
}

export async function query(sql: string, params: any[] = []) {
    const database = await getDb();
    if (isPostgres) {
        let i = 1;
        const pgSql = sql.replace(/\?/g, () => `$${i++}`);
        const result = await database.query(pgSql, params);
        return result.rows;
    } else {
        return database.prepare(sql).all(...params);
    }
}

export async function get(sql: string, params: any[] = []) {
    const database = await getDb();
    if (isPostgres) {
        let i = 1;
        const pgSql = sql.replace(/\?/g, () => `$${i++}`);
        const result = await database.query(pgSql, params);
        return result.rows[0];
    } else {
        return database.prepare(sql).get(...params);
    }
}

export async function run(sql: string, params: any[] = []) {
    const database = await getDb();
    if (isPostgres) {
        let i = 1;
        const pgSql = sql.replace(/\?/g, () => `$${i++}`);
        const result = await database.query(pgSql, params);
        return { lastInsertRowid: result.insertId || (result.rows[0] ? result.rows[0].id : null) };
    } else {
        return database.prepare(sql).run(...params);
    }
}

export async function exec(sql: string) {
    const database = await getDb();
    if (isPostgres) {
        return await database.query(sql);
    } else {
        return database.exec(sql);
    }
}
