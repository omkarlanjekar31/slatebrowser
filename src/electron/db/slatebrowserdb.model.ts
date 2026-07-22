export type BookmkarType = {
  id: number | bigint;
  url: string;
  name?: string;
  created_at:string;
  updated_at:string
};


export type AddBookmarkType = {
    url:string;
    name?:string;
}


export type UpdateBookmarkType = {
    id:number | bigint;
    url:string;
    name?:string;
}


