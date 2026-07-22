import { configureStore } from '@reduxjs/toolkit';
import tabsReducer from '../features/tabsSlice';
import layoutReducer from '../features/layoutSlice';
import bookmarksReducer from '../features/bookmarksSlice';
import walletReducer from '../features/walletSlice';
import { setupListeners } from "@reduxjs/toolkit/query";
export const store = configureStore({
    reducer: {
        tabs: tabsReducer,
        layout: layoutReducer,
        bookmarks: bookmarksReducer,
        wallet: walletReducer,
    },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
setupListeners(store.dispatch);
// export const useAppSelector:TypedUseSelectorHook<RootState>  = useSelector;
