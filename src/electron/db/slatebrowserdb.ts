import { app } from "electron";
import path from "path";

import Database from "better-sqlite3";
import type { Database as BetterSqliteDatabase } from "better-sqlite3";
import {
  AddBookmarkType,
  BookmkarType,
  UpdateBookmarkType,
} from "./slatebrowserdb.model.js";

class SlateBrowserDatabase {
  private db: BetterSqliteDatabase;
  constructor() {
    const dbPath = path.join(app.getPath("userData"), "slatebrowserdb.sqlite");
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.setUpDatabase();
  }

  setUpDatabase() {
    this.db.exec(`
            CREATE TABLE IF NOT EXISTS bookmarks(
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 url TEXT NOT NULL,
                 name TEXT NULL,
                 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        
        `);

    console.log("slatebrowser db initialized!");
  }

  addBookmark(bookmark: AddBookmarkType): BookmkarType | undefined {
    const { url, name } = bookmark;

    const stmt = this.db.prepare(`
            INSERT INTO bookmarks(url,name) values(?,?);
        `);
    const info = stmt.run(url, name);
    const id = info.lastInsertRowid;

    const insertedBookmark = this.getBookmarkById(id);
    return insertedBookmark;
  }

  getBookmarkById(id: number | bigint): BookmkarType | undefined {
    const row = this.db.prepare("SELECT * FROM bookmarks WHERE id = ?").get(id);

    if (!row) return undefined;

    return row as BookmkarType;
  }

  deleteBookmark(id: number | bigint): boolean {
    const stmt = this.db.prepare(`
            DELETE FROM bookmarks WHERE id = ? ;
        `);
    const info = stmt.run(id);
    const isDeleted = info.changes > 0;
    return isDeleted;
  }

  updateBookmark(props: UpdateBookmarkType): BookmkarType | undefined {
    const { id, url, name } = props;
    const stmt = this.db.prepare(`
            UPDATE bookmarks SET url = ?, name = ? WHERE id = ?;
        `);
    const info = stmt.run(url, name, id);
    const isUpdated = info.changes > 0;
    const updatedBookmark = this.getBookmarkById(id);
    return updatedBookmark;
  }

  getAllBookmark(): BookmkarType[] {
    const stmt = this.db.prepare("SELECT * FROM bookmarks");
    return stmt.all() as BookmkarType[];
  }

  close() {
    this.db.close();
    console.log("slatebrowser db closed.");
  }
}

export default SlateBrowserDatabase;
