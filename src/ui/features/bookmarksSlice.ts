import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
export type InitialBookmark = {
  bookmarks: BookmkarType[];
};
const initialState = {
  bookmarks: [],
} as InitialBookmark;

const bookmarksSlice = createSlice({
  name: "bookmarks",
  initialState,
  reducers: {
    addBookmark: (state, action: PayloadAction<BookmkarType>) => {
      const bookmardpayload = action.payload;
      state.bookmarks.push(bookmardpayload);
    },
    deleteBookmark: (state, action: PayloadAction<number | bigint>) => {
      state.bookmarks = state.bookmarks.filter((b) => b.id !== action.payload);
    },
    updateBookmark: (state, action: PayloadAction<BookmkarType>) => {
      const updatedBookmarkPayload = action.payload;
      const bookmarkcopy = state.bookmarks;
      const updatedbookmark = bookmarkcopy.map((bookmark) => {
        if (bookmark.id == updatedBookmarkPayload.id) {
          const updateBookmark: BookmkarType = {
            created_at: updatedBookmarkPayload.created_at,
            updated_at: updatedBookmarkPayload.updated_at,
            id: updatedBookmarkPayload.id,
            url: updatedBookmarkPayload.url,
            name: updatedBookmarkPayload.name,
          };
          return updateBookmark;
        }
        return bookmark;
      });
      state.bookmarks = updatedbookmark;
    },
    getAllBookmark: (state, action: PayloadAction<BookmkarType[]>) => {
      state.bookmarks = action.payload;
    },
  },
});

export const { addBookmark, deleteBookmark, updateBookmark, getAllBookmark } =
  bookmarksSlice.actions;
export default bookmarksSlice.reducer;
