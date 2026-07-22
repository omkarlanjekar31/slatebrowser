import React, { useEffect, useRef } from "react";
import { computeNativeBounds } from "../helpers/Browser.helper";
import { useAppDispatch, useAppSelector } from "../hooks/useTypedSelector";
import {
  setActiveTab,
  setTabNavigated,
  setViewBounds,
} from "../features/tabsSlice";

export default function BrowserViewsArea({
  browserViewsRef,
}: {
  browserViewsRef: React.RefObject<HTMLDivElement | null>;
}) {
  const dispatch = useAppDispatch();
  const { tabs, activeTabId } = useAppSelector((state) => state.tabs);
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const indexHtmlPage = useAppSelector(state => state.tabs.indexHTMLPath)

  useEffect(() => {
    async function attach() {
      if (!browserViewsRef || !browserViewsRef.current) return;

      const boundsRect = browserViewsRef.current.getBoundingClientRect();

      // MUST await the async IPC call
      const winBounds =
        await window.electronBrowserTabs.getWindowContentBounds();
      if (!boundsRect || !winBounds) return;

      const nativeBounds = computeNativeBounds(boundsRect, winBounds);

      dispatch(setViewBounds(nativeBounds));

      if (activeTab && activeTab.url != "about:blank") {
        
        const updatedTab = await window.electronBrowserTabs.attachTab({
          id: activeTab?.id || "",
          url: activeTab?.url,
          bounds: nativeBounds,
        });
        console.log("updatedTab",updatedTab)
        dispatch(setActiveTab(updatedTab.id))
      }
    }

    // attach();
  }, [activeTabId]);

  useEffect(() => {
    let listener: any;

    if (window.electronBrowserTabs.onTabNavigated) {
      listener = window.electronBrowserTabs.onTabNavigated((data: OnTabNavigatePayload) => {
        console.log("indexHtmlPage",indexHtmlPage)
        console.log("Data",data)
        if (data && data.id) {
        const payload = {
           id: data.id, 
           url: data.url ===indexHtmlPage? "":data.url
           }

           
          dispatch(setTabNavigated(payload));
        }
      });
    }

    return () => {
      if (listener && window.electronBrowserTabs.offTabNavigated) {
        window.electronBrowserTabs.offTabNavigated(listener);
      }
    };
  }, [activeTabId]);

  return (
    <div className="flex flex-col w-full h-full">
      {/* <div className="w-full border border-red-500">Hello</div> */}
      <div
        ref={browserViewsRef}
        className="flex-1 h-full w-full  relative bg-white overflow-hidden"
      ></div>
    </div>
  );
}
