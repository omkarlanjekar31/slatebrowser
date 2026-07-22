import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type InitialStateBrowser = {
  tabs: Tab[];
  currentUrl: string;
  viewBounds: ViewBounds;
  activeTabId: string | null;
  indexHTMLPath: string;
};

export type SetTabNavigatedPayload = {
  id: string;
  url: string;
};

export type UpdateBrowserUrl = {
  tabId: string;
  url: string;
};

const initialState = {
  tabs: [],
  activeTabId: null,
  currentUrl: "",
  viewBounds: { x: 0, y: 0, width: 0, height: 0 },
  indexHTMLPath: "",
} as InitialStateBrowser;

const tabsSlice = createSlice({
  name: "tabs",
  initialState,
  reducers: {
    initializeBrowserState: () => {
      return initialState;
    },
    setViewBounds: (state, action: PayloadAction<ViewBounds>) => {
      return {
        ...state,
        viewBounds: {
          x: action.payload.x,
          y: action.payload.y,
          width: action.payload.width,
          height: action.payload.height,
        },
      };
    },

    setInitializeTab: (state, action: PayloadAction<InitialTab>) => {
      const newTab = action.payload;
      const tabsCopy = [...state.tabs];
      const isExist = tabsCopy.find((f) => f.id == newTab.id);
      if (!isExist) {
        console.log("NEWTAB:", newTab);
        const tab: Tab = {
          id: newTab.id,
          active: newTab.active,
          favIcon: newTab.favIcon,
          isStartedEdittingTypedUrl: newTab.isStartedEdittingTypedUrl,
          title: newTab.title,
          typedUrl: newTab.typedUrl,
          url: newTab.url,
        };
        tabsCopy.push(tab);
      }
      return {
        ...state,
        tabs: tabsCopy,
        activeTabId: newTab.id,
        currentUrl: newTab.url,
        indexHTMLPath: newTab.indexHTMLPath,
      };
    },

    addTab: (state, action: PayloadAction<Tab>) => {
      const newTabPayload = action.payload;
      const tabsCopy = [...state.tabs];
      const isExist = tabsCopy.find((f) => f.id == newTabPayload.id);
      if (!isExist) {
        const newTab: Tab = {
          active: newTabPayload.active,
          favIcon: newTabPayload.favIcon,
          id: newTabPayload.id,
          isStartedEdittingTypedUrl: newTabPayload.isStartedEdittingTypedUrl,
          title: newTabPayload.title,
          typedUrl: newTabPayload.typedUrl,
          url: newTabPayload.url,
        };
        tabsCopy.push(newTab);
        return {
          ...state,
          tabs: tabsCopy,
          activeTabId: newTab.id,
          currentUrl: newTab.url,
        };
      }
    },
    closeTab: (state, action: PayloadAction<string>) => {
      const tabId = action.payload;
      const tabs = [...state.tabs];
      const tabIndex = tabs.findIndex((t) => t.id === tabId);

      if (tabIndex === -1) return { ...state };

      let activeTabId = state.activeTabId;

      // If the active tab is being closed
      if (state.activeTabId === tabId) {
        const nextTab = tabs[tabIndex + 1];
        const prevTab = tabs[tabIndex - 1];

        // Chrome logic: right first, then left
        if (nextTab) {
          activeTabId = nextTab.id;
        } else if (prevTab) {
          activeTabId = prevTab.id;
        } else {
          activeTabId = ""; // no tabs left
          window.electronBrowserTabs.sendFrameAction("CLOSE");
        }
      }

      const updatedTabs = tabs.filter((t) => t.id !== tabId);

      const currentUrl =
        updatedTabs.find((t) => t.id === activeTabId)?.url || "";

      return {
        ...state,
        tabs: updatedTabs,
        activeTabId,
        currentUrl,
      };
    },

    setActiveTab: (state, action: PayloadAction<string>) => {
      const tabId = action.payload;
      const tabsCopy = [...state.tabs];
      const activeTab = tabsCopy.find((f) => f.id == tabId);
      if (activeTab) {
        return {
          ...state,
          tabs: tabsCopy,
          currentUrl: activeTab.url,
          activeTabId: activeTab.id,
        };
      }
    },
    setTabNavigated: (state, action: PayloadAction<SetTabNavigatedPayload>) => {
      const tabId = action.payload.id;
      const url = action.payload.url;
      const tabsCopy = [...state.tabs];
      const newTabCopy = tabsCopy.map((tab) => {
        if (tab.id == tabId) {
          return {
            ...tab,
            url: url,
            typedUrl: url,
            isStartedEdittingTypedUrl: false,
            title: url == "" ? "New Tab" : url,
            active: true,
            favIcon: "",
          };
        }
        return tab;
      });
      return {
        ...state,
        tabs: newTabCopy,
        currentUrl: url,
        activeTabId: tabId,
      };
    },
    updateTab: (state, action: PayloadAction<Tab>) => {
      const tabsCopy = [...state.tabs];
      const updatedTabsCopy = tabsCopy.map((tab) => {
        if (tab.id == action.payload.id) {
          return action.payload;
        }
        return tab;
      });

      return {
        ...state,
        tabs: updatedTabsCopy,
      };
    },
    updateSingleTabUrl: (state, action: PayloadAction<UpdateBrowserUrl>) => {
      let url = action.payload.url;
      const tabId = action.payload.tabId;
      const tabsCopy = state.tabs;

      const updatedTabs = tabsCopy.map((tab) => {
        if (tab.id === tabId) {
          return {
            ...tab,
            url: url,
            typedUrl: url,
            isStartedEdittingTypedUrl: false,
            title: url,
            active: true,
            favIcon: "",
          };
        }
        return tab;
      });

      return {
        ...state,
        currentUrl: url,
        tabs: updatedTabs,
        activeTabId: tabId,
      };
    },
  
    handleInputUrlChange: (state, action: PayloadAction<string>) => {
      const updatedUrl = action.payload;
      const tabs: Tab[] = [...state.tabs];
      const updatedTabs: Tab[] = tabs.map((tab: Tab) => {
        if (tab.id == state.activeTabId) {
          return {
            ...tab,
            typedUrl: updatedUrl,
            isStartedEdittingTypedUrl: true,
          };
        }
        return tab;
      });

      return {
        ...state,
        tabs: updatedTabs,
      };
    },
    goToHomeTab: (state, action: PayloadAction<Tab>) => {
      const homeTabPayload = action.payload;
      const tabsCopy = [...state.tabs];
      const updatedTabsCopy = tabsCopy.map((tab) => {
        if (tab.id == homeTabPayload.id) {
          const homeTab: Tab = {
            active: homeTabPayload.active,
            favIcon: homeTabPayload.favIcon,
            id: homeTabPayload.id,
            isStartedEdittingTypedUrl: homeTabPayload.isStartedEdittingTypedUrl,
            title: homeTabPayload.title,
            typedUrl: homeTabPayload.typedUrl,
            url: homeTabPayload.url,
          };
          return homeTab;
        }
        return tab;
      });

      return {
        ...state,
        tabs: updatedTabsCopy,
      };
    },
  },
});

export const {
  initializeBrowserState,
  setInitializeTab,
  setViewBounds,
  addTab,
  closeTab,
  setActiveTab,
  updateTab,
  setTabNavigated,
  updateSingleTabUrl,
  handleInputUrlChange,
  goToHomeTab,
} = tabsSlice.actions;
export default tabsSlice.reducer;
