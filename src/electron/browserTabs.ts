import { ipcMain, WebContentsView } from "electron";
import { v4 as uuidv4 } from "uuid";
import { getPreloadPath } from "./pathResolver.js";
import { isDev } from "./util.js";
import type { BrowserWindow as BrowserWindowType } from "electron";
const views = new Map<string, WebContentsView>(); // id → WebContentsView
const wcToTab = new Map<number, string>();
const tabs = new Map<string, Tab>();
let activeTabId: string | null = null;

export function browserTabs(mainWindow: BrowserWindowType) {
  /* ---------- TAB NAVIGATION HANDLERS ---------- */


  
  // Create a tab
  ipcMain.handle("tab:add", (_e, { bounds }: AddTabPayload) => {
    // const id = uuidv4();
    // if (!mainWindow || views.has(id)) return false;
    console.log({ omkar: bounds });

    const tabId = uuidv4();
    const newTab: Tab = {
      id: tabId,
      title: "New Tab",
      url: "about:blank",
      favIcon: "",
      active: true,
      isStartedEdittingTypedUrl: false,
      typedUrl: "about:blank",
    };
    const view = new WebContentsView({
      webPreferences: {
        preload: getPreloadPath(),
        contextIsolation: true,
        // 🔥 DEV ONLY
        allowRunningInsecureContent: isDev() ? true : false,
        webSecurity: isDev() ? false : true,
      },
    });



    views.set(newTab.id, view);
    // wcToTab.set(view.webContents.id, newTab.id);
view.webContents.setBackgroundThrottling(false);
    // set bounds manually
    view.setBounds({
      x: Math.floor(bounds.x),
      y: Math.floor(bounds.y),
      width: Math.floor(bounds.width),
      height: Math.floor(bounds.height),
    });

    if (!mainWindow.contentView.children.includes(view)) {
      mainWindow.contentView.addChildView(view);
    }

    
views.forEach((v, otherId) => {
  if (otherId === newTab.id) {
    mainWindow.contentView.addChildView(v); // bring to top
  } else {
    mainWindow.contentView.removeChildView(v); // hide
  }
});

    view.webContents.loadURL(newTab.url);
    return newTab;
  });

  // Close a tab
  ipcMain.handle("tab:close", (_e, { id }) => {
    const view = views.get(id);
    if (!view || !mainWindow) return false;

    mainWindow.contentView.removeChildView(view);
    view.webContents.close();
    views.delete(id);
    return true;
  });
  // Attach and show a tab
  ipcMain.handle("tab:attach", (_e, payload: AttachTabPayload) => {
    console.log({ omiii: payload });
    let { bounds, url, id } = payload;

    if (!mainWindow || !id) return;
    let view = views.get(id);

    // if (!view) {
    //   view = new WebContentsView({
    //     webPreferences: {
    //       preload: getPreloadPath(),
    //       contextIsolation: true,
    //       // 🔥 DEV ONLY
    //       allowRunningInsecureContent: isDev() ? true : false,
    //       webSecurity: isDev() ? false : true,
    //     },
    //   });

    //   views.set(id, view);
    // }

    if (!view) return;

    views.forEach((v, otherId) => {
      if (otherId === id) {
        mainWindow.contentView.addChildView(v); // bring to top
      } else {
        mainWindow.contentView.removeChildView(v); // hide
      }
    });

    // set bounds manually
    view.setBounds({
      x: Math.floor(bounds.x),
      y: Math.floor(bounds.y),
      width: Math.floor(bounds.width),
      height: Math.floor(bounds.height),
    });

    if (!url) {
      url = "about:blank";
    }
    view.webContents.loadURL(url);
    // Store tab metadata
    tabs.set(id, {
      id,
      url: url || "",
      title: "",
      favIcon: "",
      active: true,
      isStartedEdittingTypedUrl: false,
      typedUrl: url || "",
    });

    return {
      id: id,
      url: url,
    };

    // view.webContents.openDevTools({ mode: "detach" });
  });

  // Back / forward / update URL / home
  ipcMain.handle("tab:back", (_e, { id }) => {
    const view = views.get(id);
    if (view && view.webContents.navigationHistory.canGoBack())
      view.webContents.navigationHistory.goBack();
  });
  ipcMain.handle("tab:forward", (_e, { id }) => {
    const view = views.get(id);
    if (view && view.webContents.navigationHistory.canGoForward())
      view.webContents.navigationHistory.goForward();
  });
  ipcMain.handle("tab:updateUrl", (_e, { id }) => {
    const view = views.get(id);

    // view?.webContents.loadURL(url);
  });
  ipcMain.handle("tab:home", (_e, { id, homeUrl }) => {
    views.get(id)?.webContents.loadURL(homeUrl);
  });

  // Receive from UI and resize BrowserViews
  ipcMain.on("update-view-bounds", (_event, bounds: ViewBounds) => {
    if (!mainWindow) return;

    views.forEach((view) => {
      view.setBounds({
        x: Math.floor(bounds.x),
        y: Math.floor(bounds.y),
        width: Math.floor(bounds.width),
        height: Math.floor(bounds.height),
      });
    });
  });

  ipcMain.handle("window:getContentBounds", () => {
    if (!mainWindow) return null;
    return mainWindow.getContentBounds();
  });


  
}

export function initBrowserTab(mainWindow: BrowserWindowType) {
  const defaultId = uuidv4();
  const view = new WebContentsView({
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      allowRunningInsecureContent: isDev(),
      webSecurity: !isDev(),
    },
  });

  views.set(defaultId, view);
  wcToTab.set(view.webContents.id, defaultId);

  view.webContents.loadURL("about:blank");
  mainWindow.webContents.once("did-finish-load", () => {
    mainWindow.webContents.send("browser:initialize", {
      id: defaultId,
      title: "New Tab",
      url: "about:blank",
      favIcon: "",
      active: true,
      isStartedEdittingTypedUrl: false,
      typedUrl: "about:blank",
    });
  });
}
/////////


