type BookmkarType = {
  id: number | bigint;
  url: string;
  name?: string;
  created_at: string;
  updated_at: string;
};

type AddBookmarkType = {
  url: string;
  name?: string;
};

type UpdateBookmarkType = {
  id: number | bigint;
  url: string;
  name?: string;
};

type EventPayloadSlateBrowserDBAPIResponseMapping = {
  addBookmark: BookmkarType | undefined;
  getBookmarkById:  BookmkarType | undefined;
  deleteBookmark: boolean;
  updateBookmark:  BookmkarType | undefined;
  getAllBookmark: BookmkarType[];
};

type EventSlateBrowserDBAPIParamsMapping = {
  addBookmark: AddBookmarkType;
  getBookmarkById: {
    id: number | bigint;
  };
  deleteBookmark: {
    id: number | bigint;
  };
  updateBookmark: UpdateBookmarkType;
  getAllBookmark: {};
};

interface Window {
  slatebrowserdbAPI: {
    addBookmark: (props: AddBookmarkType) => Promise<BookmkarType | undefined>;
    deleteBookmark: (id: number | bigint) => Promise< boolean>;
    updateBookmark: (props: UpdateBookmarkType) => Promise< BookmkarType | undefined>;

    getAllBookmark: () => Promise<BookmkarType[]>;
  };
}
