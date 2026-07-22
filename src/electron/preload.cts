import type { IpcRendererEvent } from "electron";
const electron = require("electron");

// listen to the event as soon as preload loads

electron.contextBridge.exposeInMainWorld("electron", {
  subscribeStatistics: (callback) => {
    return ipcOn("statistics", (stats) => {
      callback(stats);
    });
  },
  getStaticData: () => ipcInvoke("getStaticData"),
} satisfies Window["electron"]);

electron.contextBridge.exposeInMainWorld("dbAPI", {
  addTask: (title: string) => ipcInvokeDBAPI("addTask", { title }),
  deleteTask: (id: number) => ipcInvokeDBAPI("deleteTask", { id }),
  markCompletedTask: (params) => ipcInvokeDBAPI("markCompletedTask", params),
  getAllTasks: () => ipcInvokeDBAPI("getAllTasks", {}),
} satisfies Window["dbAPI"]);

electron.contextBridge.exposeInMainWorld("slatebrowserdbAPI", {
  addBookmark: (props: AddBookmarkType) =>
    ipcInvokeSlateBrowserDBAPI("addBookmark", props),
  deleteBookmark: (id: number | bigint) =>
    ipcInvokeSlateBrowserDBAPI("deleteBookmark", { id }),
  updateBookmark: (props: UpdateBookmarkType) =>
    ipcInvokeSlateBrowserDBAPI("updateBookmark", props),
  getAllBookmark: () => ipcInvokeSlateBrowserDBAPI("getAllBookmark", {}),
} satisfies Window["slatebrowserdbAPI"]);

electron.contextBridge.exposeInMainWorld("electronBrowserTabs", {
  sendFrameAction: (payload) => {
    ipcSend("sendFrameAction", payload);
  },
  attachTab: (payload: any) =>
    electron.ipcRenderer.invoke("tab:attach", payload),
  addTab: (payload: AddTabPayload) =>
    electron.ipcRenderer.invoke("tab:add", payload),
  closeTab: (id: string) => electron.ipcRenderer.invoke("tab:close", { id }),
  updateUrl: (payload: UpdateTabUrlPayload) =>
    electron.ipcRenderer.invoke("tab:updateUrl", payload),
  back: (id: any) => electron.ipcRenderer.invoke("tab:back", { id }),
  forward: (id: any) => electron.ipcRenderer.invoke("tab:forward", { id }),
  home: (id: any, homeUrl: string) =>
    electron.ipcRenderer.invoke("tab:home", { id, homeUrl }),
  onNewTabFromPopup: (callback: any) => {
    electron.ipcRenderer.on(
      "newTabFromTargetBlank",
      (_event: any, url: string) => callback(url),
    );
  },
  onTabNavigated: (cb: TabNavigatedCallback) => {
    // Wrap listener so we only expose data
    const listener: TabNavigatedListener = (
      _event: any,
      data: OnTabNavigatePayload,
    ) => cb(data);
    electron.ipcRenderer.on("tab:navigated", listener);
    return listener; // return the wrapper so we can remove it
  },
  offTabNavigated: (listener: TabNavigatedListener) => {
    electron.ipcRenderer.off("tab:navigated", listener);
  },
  getWindowContentBounds: () =>
    electron.ipcRenderer.invoke("window:getContentBounds"),
  // Send UI bounds to main
  updateViewBounds: (bounds: ViewBounds) => {
    electron.ipcRenderer.send("update-view-bounds", bounds);
  },
  sendReady: () => {
    electron.ipcRenderer.send("renderer:ready");
  },
  onBrowserInitialize: (callback: (tab: InitialTab) => void) => {
    electron.ipcRenderer.on(
      "browser:initialize",
      (_event: any, tab: InitialTab) => {
        callback(tab);
      },
    );
  },
  swtichTab: (payload: SwitchTabPayload) =>
    electron.ipcRenderer.invoke("tab:switch", payload),
  urlChangeTab: (payload: URLChangeTabPayload) =>
    electron.ipcRenderer.invoke("tab:urlchange", payload),
} satisfies Window["electronBrowserTabs"]);

electron.contextBridge.exposeInMainWorld("aiChatAPI", {
  listSessions: () => ipcInvokeAIChatDBAPI("ai_chat:list_sessions", {}),
  getSessionHistory: (sessionId: string) =>
    ipcInvokeAIChatDBAPI("ai_chat:get_history", sessionId),
  sendMessage: (payload: AIChatSendMessagePayload) =>
    ipcInvokeAIChatDBAPI("ai_chat:send_message", payload),
} satisfies Window["aiChatAPI"]);

electron.contextBridge.exposeInMainWorld("browserWebPageApi", {
  getWebPageHTML: async (id: string) => {
    return await ipcInvokeAIChatAutomateAPI("get_html_from_view", id);
  },
  webPageAutomate: (payload: WebPageAutomatePayload) => {
    return ipcInvokeAIChatAutomateAPI("web_page_automate", payload);
  },
} satisfies Window["browserWebPageApi"]);

const listeners = new Map();

const ethereum = {
  isMyWallet: true,
  isMetaMask: false,

  selectedAddress: null,
  chainId: null,

  request: ({ method, params }: any) => {
    return electron.ipcRenderer.invoke("eth:request", {
      method,
      params,
      origin: window.location.origin,
    });
  },

  on: (event: any, handler: any) => {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event).add(handler);
  },

  removeListener: (event: any, handler: any) => {
    listeners.get(event)?.delete(handler);
  },
};

// Events coming from main process
electron.ipcRenderer.on("eth:event", (_e: any, { event, data }: any) => {
  listeners.get(event)?.forEach((fn: any) => fn(data));
});

electron.contextBridge.exposeInMainWorld("ethereumDemo", ethereum);

electron.contextBridge.exposeInMainWorld("wallet", {
  // Unlock wallet with password
  unlock: (password: string) =>
    electron.ipcRenderer.invoke("wallet:unlock", password),

  // Encrypt & save seed
  importSeed: (seed: string, password: string) =>
    electron.ipcRenderer.invoke("wallet:import-seed", seed, password),

  // Lock wallet
  lock: () => electron.ipcRenderer.invoke("wallet:lock"),
});
function ipcInvoke<Key extends keyof EventPayloadMapping>(
  key: Key,
): Promise<EventPayloadMapping[Key]> {
  return electron.ipcRenderer.invoke(key);
}

function ipcInvokeDBAPI<Key extends keyof EventPayloadDBAPIResponseMapping>(
  key: Key,
  params: EventDBAPIParamsMapping[Key],
): Promise<EventPayloadDBAPIResponseMapping[Key]> {
  return electron.ipcRenderer.invoke(key, params);
}

function ipcInvokeSlateBrowserDBAPI<
  Key extends keyof EventPayloadSlateBrowserDBAPIResponseMapping,
>(
  key: Key,
  params: EventSlateBrowserDBAPIParamsMapping[Key],
): Promise<EventPayloadSlateBrowserDBAPIResponseMapping[Key]> {
  return electron.ipcRenderer.invoke(key, params);
}

function ipcInvokeAIChatDBAPI<Key extends keyof EventPayloadAIChatDBAPIResponseMapping>(
  key: Key,
  params: EventAIChatDBAPIParamsMapping[Key],
): Promise<EventPayloadAIChatDBAPIResponseMapping[Key]> {
  return electron.ipcRenderer.invoke(key, params);
}

function ipcInvokeAIChatAutomateAPI<
  Key extends keyof EventPayloadAIChatAutomateResponseMapping,
>(
  key: Key,
  params: EventAIChatAutomateAPIParamsMapping[Key],
): Promise<EventPayloadAIChatAutomateResponseMapping[Key]> {
  return electron.ipcRenderer.invoke(key, params);
}

function ipcOn<Key extends keyof EventPayloadMapping>(
  key: Key,
  callback: (payload: EventPayloadMapping[Key]) => void,
) {
  const cb = (_event: IpcRendererEvent, payload: EventPayloadMapping[Key]) =>
    callback(payload);
  electron.ipcRenderer.on(key, cb);
  return () => electron.ipcRenderer.off(key, cb);
}

function ipcSend<Key extends keyof EventPayloadMapping>(
  key: Key,
  payload: EventPayloadMapping[Key],
) {
  electron.ipcRenderer.send(key, payload);
}

/*
notes
---------------
#invoke expects a response from main process
 electron.ipcRenderer.invoke("getStaticData");


*/
