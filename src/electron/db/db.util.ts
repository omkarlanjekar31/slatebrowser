import { ipcMain, WebContents, WebFrameMain } from "electron";
import { ipcMainHandle, validateEventFrame } from "../util.js";
import AppDatabase from "./database.js";
import SlateBrowserDatabase from "./slatebrowserdb.js";

export function setUpIPCHandlersDBAPI(db: AppDatabase) {
  ipcMainDBAPIHandle("addTask", (params) => {
    return db.addTask(params.title);
  });
  ipcMainDBAPIHandle("deleteTask", (params) => {
    return db.deleteTask(params.id);
  });

  ipcMainDBAPIHandle("markCompletedTask", (params) => {
    return db.markComplete(params);
  });

  ipcMainDBAPIHandle("getAllTasks", (params) => {
    return db.getAllTask();
  });
}

export function setUpIPCHandlerSlateBrowserDBAPI(db: SlateBrowserDatabase) {
  ipcMainSlateBrowserDBAPIHandle("addBookmark", (params) => {
    return db.addBookmark(params);
  });
  ipcMainSlateBrowserDBAPIHandle("deleteBookmark", (params) => {
    return db.deleteBookmark(params.id);
  });

  ipcMainSlateBrowserDBAPIHandle("getAllBookmark", (params) => {
    return db.getAllBookmark();
  });

  ipcMainSlateBrowserDBAPIHandle("getBookmarkById", (params) => {
    return db.getBookmarkById(params.id);
  });
  ipcMainSlateBrowserDBAPIHandle("updateBookmark", (params) => {
    return db.updateBookmark(params);
  });
}

export function ipcMainDBAPIHandle<
  Key extends keyof EventPayloadDBAPIResponseMapping,
>(
  key: Key,
  handler: (
    params: EventDBAPIParamsMapping[Key],
  ) =>
    | Promise<EventPayloadDBAPIResponseMapping[Key]>
    | EventPayloadDBAPIResponseMapping[Key],
) {
  ipcMain.handle(key, (event, params) => {
    validateEventFrame(event.senderFrame);
    return handler(params);
  });
}

export function ipcMainSlateBrowserDBAPIHandle<
  Key extends keyof EventPayloadSlateBrowserDBAPIResponseMapping,
>(
  key: Key,
  handler: (
    params: EventSlateBrowserDBAPIParamsMapping[Key],
  ) =>
    | Promise<EventPayloadSlateBrowserDBAPIResponseMapping[Key]>
    | EventPayloadSlateBrowserDBAPIResponseMapping[Key],
) {
  ipcMain.handle(key, (event, params) => {
    validateEventFrame(event.senderFrame);
    return handler(params);
  });
}
