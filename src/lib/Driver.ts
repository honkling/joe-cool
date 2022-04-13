import { join } from "path";
import { Database } from "sqlite3";

export default class Driver {
    public static instance: Driver;
    private static databaseInstance: Database;
    public static tagCache: Map<string, string> = new Map();

    constructor() {
        Driver.instance = this;
        Driver.databaseInstance = new Database(join(__dirname, "../../database.db"));
        Object.defineProperty(Driver, "databaseInstance", {
            writable: false,
        });
        setInterval(() => Driver.tagCache.clear(), 1000 * 60 * 30);
    }

    public static getDatabase(): Database {
        return Driver.databaseInstance;
    }
}