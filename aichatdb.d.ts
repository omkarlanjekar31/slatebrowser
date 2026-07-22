type ChatMessageType = {
  id: number | bigint;
  session_id: string;
  role: string;
  content: string | null;
  user_query: string | null;
  dom_context: string | null;
  raw_item: string;
  created_at: string;
};

type ChatSessionSummaryType = {
  session_id: string;
  message_count: number;
  last_message_at: string;
};

type AIChatSendMessagePayload = {
  sessionId: string;
  query: string;
};

type EventPayloadAIChatDBAPIResponseMapping = {
  "ai_chat:list_sessions": ChatSessionSummaryType[];
  "ai_chat:get_history": ChatMessageType[];
  "ai_chat:send_message": AIChatSheetsAutomateCalledResponseType;
};

type EventAIChatDBAPIParamsMapping = {
  "ai_chat:list_sessions": {};
  "ai_chat:get_history": string;
  "ai_chat:send_message": AIChatSendMessagePayload;
};

interface Window {
  aiChatAPI: {
    listSessions: () => Promise<ChatSessionSummaryType[]>;
    getSessionHistory: (sessionId: string) => Promise<ChatMessageType[]>;
    sendMessage: (
      payload: AIChatSendMessagePayload,
    ) => Promise<AIChatSheetsAutomateCalledResponseType>;
  };
}
