import {
  app,
  BrowserView,
  BrowserWindow,
  ipcMain,
  WebContentsView,
} from "electron";
import type { BrowserWindow as BrowserWindowType } from "electron";
import { ipcMainHandle, ipcMainOn, isDev } from "./util.js";
import {
  getPreloadPath,
  getUIPath,
} from "./pathResolver.js";
import pkg from "electron-updater";
const { autoUpdater, AppUpdater } = pkg;

import { getStaticData, pollResources } from "./resourceManager.js";
import { createTray } from "./tray.js";
import AppDatabase from "./db/database.js";
import { v4 as uuidv4 } from "uuid";
import { desktopUIURL } from "./config.js";
import WalletAppDatabase from "./db/wallet.db.js";
import setUpIPCHandlersWalletDBAPI from "./helpers/walletIPCMain.js";
import { browserTabs } from "./newBrowserTabsCode.js";
import SlateBrowserDatabase from "./db/slatebrowserdb.js";
import { setUpIPCHandlerSlateBrowserDBAPI } from "./db/db.util.js";
import { browserTabWebPageIPCMainHelper } from "./browerTabWebPageIPCMainHelper.js";


let dbWallet: WalletAppDatabase;
let slatebrowserdb: SlateBrowserDatabase;

let mainWindow: BrowserWindowType | null = null;

//basic flags for autoUpdater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

const views = new Map<string, WebContentsView>(); // id → WebContentsView
const wcToTab = new Map<number, string>();

app.on("ready", () => {
  dbWallet = new WalletAppDatabase();
  slatebrowserdb = new SlateBrowserDatabase();
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,

    // titleBarStyle: "hidden", // optional on macOS
    // titleBarOverlay: false, // optional
    webPreferences: {
      preload: getPreloadPath(),
      devTools: isDev() ? true : false,
      webviewTag: false, // enable <webview> tags
      contextIsolation: true,
      allowRunningInsecureContent: isDev() ? true : false,
      webSecurity: isDev() ? false : true,
    },
  });

  // // Remove File/Edit/View/etc menu
  // Menu.setApplicationMenu(null);

  mainWindow.maximize();

  autoUpdater.checkForUpdates();

  if (isDev()) {
    mainWindow.loadURL(desktopUIURL);
  } else {
    mainWindow.loadFile(getUIPath());
  }


  browserTabs(mainWindow,views, wcToTab);
  browserTabWebPageIPCMainHelper(mainWindow, views, wcToTab);

  // pollResources(mainWindow);

  //handle:because UI expects from backend to respond.
  ipcMainHandle("getStaticData", () => {
    return getStaticData();
  });

  ipcMainOn("sendFrameAction", (payload) => {
    switch (payload) {
      case "CLOSE":
        mainWindow?.close();
        break;
      case "MAXIMIZE":
        mainWindow?.maximize();
        break;
      case "MINIMIZE":
        mainWindow?.minimize();
        break;
    }
  });

  setUpIPCHandlersWalletDBAPI(dbWallet);

  /*Wallet Integration*/

  // let currentAccount = "0x1234...";
  // let currentChainId = 1;

  // ipcMain.handle("eth:request", async (event, payload) => {
  //   if (!mainWindow) return null;

  //   const tabId = wcToTab.get(event.sender.id);
  //   if (!tabId) throw new Error("Unknown tab");

  //   return handleEthRequest(mainWindow, views, tabId, payload);
  // });

  // handleCustomWalletIPCMain(mainWindow, views, wcToTab);

  setUpIPCHandlerSlateBrowserDBAPI(slatebrowserdb);
  createTray(mainWindow);
});

autoUpdater.on("update-available", (info) => {
  console.log("Update avaiable");
  // let pth = autoUpdater.downloadUpdate();
});

autoUpdater.on("update-not-available", (info) => {
  console.log("NO update available");
});

autoUpdater.on("update-downloaded", (info) => {
  console.log("Update download");
});

autoUpdater.on("error", (info) => {
  console.log("Error in autoUpdate :", info);
});

app.on("window-all-closed", () => {
  dbWallet.close();
  slatebrowserdb.close();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
