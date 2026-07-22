import { ipcMain, WebContentsView } from "electron";
import { v4 as uuidv4 } from "uuid";
import {
  getIndexHtmlPage,
  getInjectedpreloadbrowserPath,
  getPreloadPath,
} from "./pathResolver.js";
import { isDev } from "./util.js";
import type { BrowserWindow as BrowserWindowType } from "electron";
import { pathToFileURL } from "url";

const tabs = new Map<string, Tab>();
let activeTabId: string | null = null;

export function browserTabs(
  mainWindow: BrowserWindowType,
  views: Map<string, WebContentsView>,
  wcToTab: Map<number, string>,
) {
  /* ---------- TAB NAVIGATION HANDLERS ---------- */

  // Create a tab
  ipcMain.handle("tab:add", (_e, { bounds }: AddTabPayload) => {
    const tabId = uuidv4();
    const newTab: Tab = {
      id: tabId,
      title: "New Tab",
      url: "",
      favIcon: "",
      active: true,
      isStartedEdittingTypedUrl: false,
      typedUrl: "",
    };

    const view = setupViewLocal(mainWindow, bounds);
    views.set(newTab.id, view);
    return newTab;
  });

  // Close a tab
  ipcMain.handle("tab:close", (_e, { id }) => {
    const view = views.get(id);
    if (!view || !mainWindow) return false;

    mainWindow.contentView.removeChildView(view);
    view.webContents.close();
    views.delete(id);
    return id;
  });
  // Attach and show a tab
  ipcMain.handle("tab:attach", (_e, payload: AttachTabPayload) => {
    let { bounds, url, id } = payload;

    if (!mainWindow || !id) return;
    let view = views.get(id);

    if (!view) return;

    switchView(mainWindow, view);
  });
  ipcMain.handle("tab:switch", (_e, payload: SwitchTabPayload) => {
    let { bounds, id } = payload;

    if (!mainWindow || !id) return;
    let view = views.get(id);

    if (!view) return;

    switchView(mainWindow, view);

    const result = id;

    return result;
  });
  ipcMain.handle("tab:urlchange", (_e, payload: URLChangeTabPayload) => {
    let { bounds, url, id } = payload;

    if (!mainWindow || !id) return;
    let view = views.get(id);

    if (!view) return;

    setupView(mainWindow, view, id, bounds, url);

    const result: Tab = {
      id: id,
      active: true,
      url: url ? url : "",
      typedUrl: url ? url : "",
      favIcon: "",
      isStartedEdittingTypedUrl: false,
      title: url ? url : "",
    };

    return result;
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
  });
  ipcMain.handle("tab:home", (_e, { id, homeUrl }) => {
    if (homeUrl == "") {
      const indexPage = getIndexHtmlPage("index.html");
      views.get(id)?.webContents.loadFile(indexPage);
      const homeTab: Tab = {
        active: true,
        favIcon: "",
        id: id,
        url: "",
        isStartedEdittingTypedUrl: false,
        title: "New Tab",
        typedUrl: "",
      };

      return homeTab;
    } else {
      views.get(id)?.webContents.loadURL(homeUrl);
      const homeTab: Tab = {
        active: true,
        favIcon: "",
        id: id,
        url: homeUrl,
        isStartedEdittingTypedUrl: false,
        title: homeUrl,
        typedUrl: homeUrl,
      };

      return homeTab;
    }
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

  ipcMain.once("renderer:ready", (event) => {
    const defaultTabId = uuidv4();
    const bounds: ViewBounds = {
      x: 0,
      y: 1,
      width: 500,
      height: 500,
    };
    const view = setupViewLocal(mainWindow, bounds);

    view.webContents.on("did-navigate", (_evt, navigatedUrl) => {
      mainWindow?.webContents.send("tab:navigated", {
        id: defaultTabId,
        url: navigatedUrl,
      });
    });

    view.webContents.on("did-navigate-in-page", (_evt, navigatedUrl) => {
      mainWindow?.webContents.send("tab:navigated", {
        id: defaultTabId,
        url: navigatedUrl,
      });
    });

    views.set(defaultTabId, view);
    wcToTab.set(view.webContents.id, defaultTabId);

    const indexHTMLPath = getIndexHtmlPage("index.html");

    const indexHTMLURL = pathToFileURL(indexHTMLPath).href;

    mainWindow.webContents.send("browser:initialize", {
      id: defaultTabId,
      title: "New Tab",
      url: "",
      favIcon: "",
      active: true,
      isStartedEdittingTypedUrl: false,
      typedUrl: "",
      indexHTMLPath: indexHTMLURL,
    });
  });

  /////////////////

  ipcMain.handle("get_html_source_code", async (_e, id: string) => {
    const view = views.get(id);
    if (!view) return;

    const html = await view.webContents.executeJavaScript(
      `window.document.documentElement.outerHTML`,
    );

    console.log({ html });

    return { status: true, raw_html_source_code: html };
  });
  ipcMain.handle(
    "sheets_automate_called",
    async (_e, { id, query, rawGridHtml }) => {
      const view = views.get(id);
      if (!view) return;

      const result = await view.webContents.executeJavaScript("");
      if (result?.__slateAutomationError) {
        console.error("sheets_automate_called renderer error", result);
      }

      return { status: true, message: "Done" };
    },
  );
  //////////
}

function switchView(mainWindow: BrowserWindowType, view: WebContentsView) {
  setTopWebContentsView(mainWindow, view);
}

function setTopWebContentsView(
  mainWindow: BrowserWindowType,
  view: WebContentsView,
) {
  mainWindow.contentView.removeChildView(view);
  mainWindow.contentView.addChildView(view);
}

function setupView(
  mainWindow: BrowserWindowType,
  view: WebContentsView,
  tabId: string,
  bounds: ViewBounds,
  url: string | undefined,
) {
  if (url) {
    view.webContents.loadURL(url);
    // send navigations back to React
    view.webContents.on("did-navigate", (_evt, navigatedUrl) => {
      mainWindow?.webContents.send("tab:navigated", {
        id: tabId,
        url: navigatedUrl,
      });
    });

    view.webContents.on("did-navigate-in-page", (_evt, navigatedUrl) => {
      mainWindow?.webContents.send("tab:navigated", {
        id: tabId,
        url: navigatedUrl,
      });
    });
  }
  switchView(mainWindow, view);
  view.setBounds({
    x: Math.floor(bounds.x),
    y: Math.floor(bounds.y),
    width: Math.floor(bounds.width),
    height: Math.floor(bounds.height),
  });
  return view;
}

function setupViewLocal(mainWindow: BrowserWindowType, bounds: ViewBounds) {
  const view = new WebContentsView({
    webPreferences: {
      preload: getInjectedpreloadbrowserPath(),
      contextIsolation: true,
      allowRunningInsecureContent: isDev(),
      webSecurity: !isDev(),
    },
  });

  const indexPage = getIndexHtmlPage("index.html");
  view.webContents.loadFile(indexPage);

  mainWindow.contentView.addChildView(view);

  view.setBounds({
    x: Math.floor(bounds.x),
    y: Math.floor(bounds.y),
    width: Math.floor(bounds.width),
    height: Math.floor(bounds.height),
  });

  return view;
}

/////////
