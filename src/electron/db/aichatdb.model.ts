export type ChatMessageType = {
  id: number | bigint;
  session_id: string;
  role: string;
  content: string | null;
  user_query: string | null;
  dom_context: string | null;
  raw_item: string;
  created_at: string;
};

export type AddChatMessageType = {
  session_id: string;
  role: string;
  content?: string | null;
  user_query?: string | null;
  dom_context?: string | null;
  raw_item: unknown;
};

export type ChatSessionSummaryType = {
  session_id: string;
  message_count: number;
  last_message_at: string;
};
