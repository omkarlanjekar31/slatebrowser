import { app } from "electron";
import path from "path";

import Database from "better-sqlite3";
import type { Database as BetterSqliteDatabase } from "better-sqlite3";

class WalletAppDatabase {
  private db: BetterSqliteDatabase;
  constructor() {
    const dbPath = path.join(app.getPath("userData"), "users.sqlite");
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.setUpDatabase();
  }

  setUpDatabase() {
    this.db.exec(`
            CREATE TABLE IF NOT EXISTS Wallet (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            encryptedSeed TEXT NOT NULL,
            salt TEXT NOT NULL,
            iv TEXT NOT NULL,
            authTag TEXT NOT NULL,
            passwordHash TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            `);

    console.log("db initialized!");
  }

  getWallet() {
    const stmt = this.db.prepare(`
            SELECT * FROM wallet LIMIT 1;
        `);

    return stmt.get();
  }

  createWallet(wallet: IWalletType): any {
    const stmt = this.db.prepare(`
        INSERT INTO Wallet (encryptedSeed, salt, iv, authTag, passwordHash)
        VALUES (?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      wallet.encryptedSeed,
      wallet.salt,
      wallet.iv,
      wallet.authTag,
      wallet.passwordHash
    );
    const response: any = {
      id: info.lastInsertRowid,
      completed: 0,
    };

    return response;
  }

  addTask(title: string): AddTaskResponse {
    const stmt = this.db.prepare(`
            INSERT INTO tasks(title) values(?);
        `);
    const info = stmt.run(title);

    const response: AddTaskResponse = {
      id: info.lastInsertRowid,
      title: title,
      completed: 0,
    };

    return response;
  }

  deleteTask(id: number): boolean {
    const stmt = this.db.prepare(`
            DELETE FROM task WHERE id = ? ;
        `);
    const info = stmt.run(id);
    const isDeleted = info.changes > 0;
    return isDeleted;
  }

  markComplete(props: EventDBAPIParamsMapping["markCompletedTask"]): boolean {
    const stmt = this.db.prepare(`
            UPDATE tasks SET completed = ? WHERE id = ?;
        `);
    const info = stmt.run(props.completed, props.id);
    const isUpdated = info.changes > 0;
    return isUpdated;
  }

  getAllTask(): GetAllTasks {
    const stmt = this.db.prepare("SELECT * FROM tasks ORDER BY id DESC;");
    return stmt.all();
  }

  close() {
    this.db.close();
    console.log("db closed.");
  }
}

export default WalletAppDatabase;
