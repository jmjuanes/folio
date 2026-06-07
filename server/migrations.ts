import fs from "node:fs/promises";
import path from "node:path";
import { createLogger } from "./utils/logger.ts";

const MIGRATIONS_TABLE = "migrations";
const MIGRATIONS_DIR = path.resolve("migrations");

const { debug } = createLogger("folio::migration");

// run the provided migrations in the database
export const runMigrations = async (db: any) => {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
            id TEXT NOT NULL PRIMARY KEY,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // read migrations and sort by name
    const files = (await fs.readdir(MIGRATIONS_DIR))
        .filter(f => f.endsWith(".sql"))
        .sort();

    for (const file of files) {
        const id = file.replace(".sql", "");
        const applied = await db.get(`SELECT id FROM ${MIGRATIONS_TABLE} WHERE id = ?`, [id]);
        if (!applied) {
            debug(`applying migration: ${id}`);
            const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), "utf-8");
            await db.exec(sql);
            await db.run(`INSERT INTO ${MIGRATIONS_TABLE} (id) VALUES (?)`, [id]);
            debug(`migration applied: ${id}`);
        }
    }
};
