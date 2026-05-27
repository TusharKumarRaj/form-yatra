import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import path from "node:path";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
}

async function runMigrations() {
    console.log("Running database migrations...");
    const pool = new Pool({ connectionString: DATABASE_URL });
    const db = drizzle(pool);
    const migrationsFolder = path.join(__dirname, "../../drizzle");
    await migrate(db, { migrationsFolder });
    await pool.end();
    console.log("Migrations completed successfully!");
}

runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Migration failed:", err);
        process.exit(1);
    });
