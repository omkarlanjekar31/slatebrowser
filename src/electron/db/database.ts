import { app } from "electron";
import path from "path";

import Database from "better-sqlite3";
import type { Database as BetterSqliteDatabase } from "better-sqlite3";

class AppDatabase {
  private db: BetterSqliteDatabase;
  constructor() {
    const dbPath = path.join(app.getPath("userData"), "to-do.sqlite");
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.setUpDatabase();
  }

  setUpDatabase() {
    this.db.exec(`
            CREATE TABLE IF NOT EXISTS tasks(
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 title TEXT NOT NULL,
                 completed INTEGER NOT NULL DEFAULT 0
            )
        
        
        `);

    console.log("db initialized!");
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

export default AppDatabase;
