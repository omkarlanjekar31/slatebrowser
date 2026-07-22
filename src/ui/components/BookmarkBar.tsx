import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Globe, X, ExternalLink } from "lucide-react";
import { deleteBookmark } from "../features/bookmarksSlice";
import { useAppDispatch, useAppSelector } from "../hooks/useTypedSelector";
import { updateSingleTabUrl } from "../features/tabsSlice";

const BookmarkBar = () => {
  const { bookmarks } = useAppSelector((state) => state.bookmarks);
  const dispatch = useAppDispatch();
  const viewBounds = useAppSelector((state) => state.tabs.viewBounds);
  const { activeTabId } = useAppSelector((state) => state.tabs);

  return (
    <div className="flex flex-row items-center px-3  bg-white border-b border-slate-200 border-t-0 h-9 space-x-1 overflow-x-auto scrollbar-hide z-0">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="flex items-center group px-1 py-1 rounded-md hover:bg-slate-100 cursor-pointer transition-all duration-200 border border-transparent hover:border-slate-200"
          onClick={async () => {
            if (activeTabId) {
              const attachTabPayload = {
                id: activeTabId,
                url: bookmark.url,
                bounds: viewBounds,
              };
              const newUpdatedTab =
                await window.electronBrowserTabs.urlChangeTab(attachTabPayload);
              dispatch(
                updateSingleTabUrl({
                  tabId: newUpdatedTab.id,
                  url: newUpdatedTab.url,
                }),
              );
            }
          }}
        >
          <div className="text-slate-500 mr-2">
            <Globe size={13} />
          </div>
          <span className="text-[13px] font-normal text-black whitespace-nowrap max-w-[150px] truncate">
            {bookmark.name}
          </span>
          <button
            onClick={async (e) => {
              e.stopPropagation();

              const isDeleted = await window.slatebrowserdbAPI.deleteBookmark(
                bookmark.id,
              );
              if (isDeleted) {
                dispatch(deleteBookmark(bookmark.id));
              }
            }}
            className="ml-2 p-0.5 rounded bg-slate-200 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={10} />
          </button>
        </div>
      ))}

      {/* Add placeholder bookmark tip if few bookmarks */}
      {bookmarks.length < 3 && (
        <div className="hidden sm:flex items-center px- py-1 rounded-md text-slate-400 text-[11px] italic">
          <ExternalLink size={11} className="mr-1" />
          <span>Click the star icon to bookmark pages</span>
        </div>
      )}
    </div>
  );
};

export default BookmarkBar;
