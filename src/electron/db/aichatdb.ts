import { app } from "electron";
import path from "path";

import Database from "better-sqlite3";
import type { Database as BetterSqliteDatabase } from "better-sqlite3";
import {
  AddChatMessageType,
  ChatMessageType,
  ChatSessionSummaryType,
} from "./aichatdb.model.js";

class AIChatDatabase {
  private db: BetterSqliteDatabase;
  constructor() {
    const dbPath = path.join(app.getPath("userData"), "aichatdb.sqlite");
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.setUpDatabase();
  }

  setUpDatabase() {
    this.db.exec(`
            CREATE TABLE IF NOT EXISTS chat_history(
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 session_id TEXT NOT NULL,
                 role TEXT NOT NULL,
                 content TEXT,
                 user_query TEXT,
                 dom_context TEXT,
                 raw_item TEXT NOT NULL,
                 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_chat_history_session_created
                ON chat_history(session_id, created_at, id);
        `);

    this.migrateSchema();

    console.log("aichat db initialized!");
  }

  // Adds columns introduced after the table already existed on disk, so upgrading
  // an existing install doesn't lose or break previously stored conversations.
  private migrateSchema() {
    const columns = this.db
      .prepare(`PRAGMA table_info(chat_history)`)
      .all() as Array<{ name: string }>;
    const columnNames = new Set(columns.map((c) => c.name));

    if (!columnNames.has("user_query")) {
      this.db.exec(`ALTER TABLE chat_history ADD COLUMN user_query TEXT;`);
    }
    if (!columnNames.has("dom_context")) {
      this.db.exec(`ALTER TABLE chat_history ADD COLUMN dom_context TEXT;`);
    }
  }

  addMessage(message: AddChatMessageType): ChatMessageType | undefined {
    const { session_id, role, content, user_query, dom_context, raw_item } = message;

    const stmt = this.db.prepare(`
            INSERT INTO chat_history(session_id, role, content, user_query, dom_context, raw_item) values(?,?,?,?,?,?);
        `);
    const info = stmt.run(
      session_id,
      role,
      content ?? null,
      user_query ?? null,
      dom_context ?? null,
      JSON.stringify(raw_item),
    );
    const id = info.lastInsertRowid;

    return this.getMessageById(id);
  }

  // Bulk insert wrapped in a transaction so appending a full agent turn (message +
  // tool calls + tool results) is a single durable write instead of N round trips.
  addMessages(sessionId: string, items: Array<Omit<AddChatMessageType, "session_id">>): void {
    if (items.length === 0) return;

    const insert = this.db.prepare(`
            INSERT INTO chat_history(session_id, role, content, user_query, dom_context, raw_item) values(?,?,?,?,?,?);
        `);
    const insertMany = this.db.transaction((rows: typeof items) => {
      for (const row of rows) {
        insert.run(
          sessionId,
          row.role,
          row.content ?? null,
          row.user_query ?? null,
          row.dom_context ?? null,
          JSON.stringify(row.raw_item),
        );
      }
    });
    insertMany(items);
  }

  getMessageById(id: number | bigint): ChatMessageType | undefined {
    const row = this.db.prepare("SELECT * FROM chat_history WHERE id = ?").get(id);

    if (!row) return undefined;

    return row as ChatMessageType;
  }

  // Reads the newest `limit` rows via the (session_id, created_at, id) index (fast DESC
  // index scan, no full-table sort), then flips the small result back to chronological order.
  getRecentHistory(sessionId: string, limit = 50): ChatMessageType[] {
    const rows = this.db
      .prepare(
        `
            SELECT * FROM (
                SELECT * FROM chat_history
                WHERE session_id = ?
                ORDER BY created_at DESC, id DESC
                LIMIT ?
            ) ORDER BY created_at ASC, id ASC
        `
      )
      .all(sessionId, limit);

    return rows as ChatMessageType[];
  }

  // Time-range lookup (e.g. "everything since the last message the client already has"),
  // served directly off the session_id + created_at index.
  getHistorySince(sessionId: string, sinceISO: string): ChatMessageType[] {
    const rows = this.db
      .prepare(
        `
            SELECT * FROM chat_history
            WHERE session_id = ? AND created_at >= ?
            ORDER BY created_at ASC, id ASC
        `
      )
      .all(sessionId, sinceISO);

    return rows as ChatMessageType[];
  }

  getFullHistory(sessionId: string): ChatMessageType[] {
    const rows = this.db
      .prepare(
        `
            SELECT * FROM chat_history
            WHERE session_id = ?
            ORDER BY created_at ASC, id ASC
        `
      )
      .all(sessionId);

    return rows as ChatMessageType[];
  }

  clearSession(sessionId: string): boolean {
    const stmt = this.db.prepare(`
            DELETE FROM chat_history WHERE session_id = ?;
        `);
    const info = stmt.run(sessionId);
    return info.changes > 0;
  }

  listSessions(): ChatSessionSummaryType[] {
    const rows = this.db
      .prepare(
        `
            SELECT session_id, COUNT(*) as message_count, MAX(created_at) as last_message_at
            FROM chat_history
            GROUP BY session_id
            ORDER BY last_message_at DESC
        `
      )
      .all();

    return rows as ChatSessionSummaryType[];
  }

  // Converts stored rows back into the original agent input items for feeding into run().
  toHistoryItems(rows: ChatMessageType[]): unknown[] {
    return rows.map((row) => JSON.parse(row.raw_item));
  }

  close() {
    this.db.close();
    console.log("aichat db closed.");
  }
}

export default AIChatDatabase;
