import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Bot, History, MessageSquare, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { useAppDispatch, useAppSelector } from "../../hooks/useTypedSelector";
import { setSelectedChatSessionId } from "../../features/layoutSlice";

interface IHistoryMessage {
  messageId: string;
  role: "user" | "assistant";
  content: string;
  rawHTML: string;
  formControlsInHTMLPage: SerializedFormControl[];
}

function toHistoryMessages(rows: ChatMessageType[]): IHistoryMessage[] {
  return rows
    .filter((row) => {
      if (row.role === "user") return Boolean(row.user_query || row.content);
      return row.role === "assistant" && Boolean(row.content);
    })
    .map((row) => ({
      messageId: String(row.id),
      role: row.role as "user" | "assistant",
      // User turns are stored with the DOM/form snapshot folded into `content`
      // for agent replay; `user_query` holds just what the user actually typed.
      content: row.role === "user" ? row.user_query || row.content || "" : row.content || "",
      rawHTML: "",
      formControlsInHTMLPage: [],
    }));
}

// Assistant replies are stored as either a JSON array of {title, markdownSubSummary}
// sections (from a page-automation turn) or plain text (from an older/one-to-one
// turn); fall back to wrapping plain text in a single untitled section.
function parseAssistantContent(content: string): BrowserSummarySection[] {
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [{ title: "", markdownSubSummary: content }];
  } catch {
    return [{ title: "", markdownSubSummary: content }];
  }
}

function formatTimestamp(sqliteUTC: string): string {
  const date = new Date(`${sqliteUTC.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return sqliteUTC;
  return date.toLocaleString();
}

export default function AIChatHistoryComponent() {
  const dispatch = useAppDispatch();
  const pendingSessionId = useAppSelector(
    (state) => state.layout.selectedChatSessionId,
  );
  const { activeTabId } = useAppSelector((state) => state.tabs);

  const [sessions, setSessions] = useState<ChatSessionSummaryType[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IHistoryMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const rows = await window.aiChatAPI.listSessions();
      setSessions(rows);
    } finally {
      setLoadingSessions(false);
    }
  };

  const openSession = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setLoadingMessages(true);
    try {
      const rows = await window.aiChatAPI.getSessionHistory(sessionId);
      setMessages(toHistoryMessages(rows));
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // AIChatHomeComponent hands off here right after a chat's first message is
  // sent, so that specific conversation opens directly instead of the list.
  // Consumed once so a later manual visit to this tab starts at the list.
  useEffect(() => {
    if (!pendingSessionId) return;
    openSession(pendingSessionId);
    dispatch(setSelectedChatSessionId(null));
  }, [pendingSessionId]);

  const goBack = () => {
    setSelectedSessionId(null);
    setMessages([]);
    setInput("");
    loadSessions();
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedSessionId || sending) return;
    const userMessageId = uuidv4();

    const userMessage: IHistoryMessage = {
      messageId: userMessageId,
      role: "user",
      content: input,
      rawHTML: "",
      formControlsInHTMLPage: [],
    };
    const messagesCopy = [...messages, userMessage];

    setMessages(messagesCopy);
    setInput("");

    if (!activeTabId) {
      return;
    }

    const webpageResponse =
      await window.browserWebPageApi.getWebPageHTML(activeTabId);

    if (webpageResponse.success) {
      const rawHTML = webpageResponse?.data?.html || "";
      const formControls = webpageResponse?.data?.formControls || "";
      const updatedMessages = messagesCopy.map((msg) => {
        if (msg.messageId == userMessageId) {
          const updateMsg: IHistoryMessage = {
            ...msg,
            rawHTML: rawHTML || "",
            formControlsInHTMLPage: formControls,
          };
          return updateMsg;
        }
        return msg;
      });

      setMessages(updatedMessages);
      const payload: WebPageAutomatePayload = {
        id: activeTabId,
        chatSessionId: selectedSessionId,
        chatHistory: updatedMessages,
      };

      setSending(true);
      try {
        const result = await window.browserWebPageApi.webPageAutomate(payload);
        const aiMessageId = uuidv4();

        if (result.status) {
          setMessages((prev) => [
            ...prev,
            {
              messageId: aiMessageId,
              role: "assistant",
              content: JSON.stringify(result.ai_response) || "",
              rawHTML: "",
              formControlsInHTMLPage: [],
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              messageId: aiMessageId,
              role: "assistant",
              content: "Unexpected response from server.",
              rawHTML: "",
              formControlsInHTMLPage: [],
            },
          ]);
        }
      } catch (err: any) {
        const aiMessageId = uuidv4();
        let errorMsg = "Something went wrong. Please try again.";

        if (err.response?.status === 400) {
          errorMsg = "Invalid request. Please check your input.";
        } else if (err.response?.status === 500) {
          errorMsg = "Server error. Please try later.";
        } else if (!err.response) {
          errorMsg = "Network error. Check your connection.";
        }

        setMessages((prev) => [
          ...prev,
          {
            messageId: aiMessageId,
            role: "assistant",
            content: errorMsg,
            rawHTML: "",
            formControlsInHTMLPage: [],
          },
        ]);
      } finally {
        setSending(false);
      }
    }
  };

  if (selectedSessionId) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center text-white">
            <Bot size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-slate-900 truncate">Chat</h2>
            <p className="text-xs text-slate-400 truncate">{selectedSessionId}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-4 bg-slate-50">
          {loadingMessages && (
            <p className="text-center text-sm text-slate-400">Loading conversation…</p>
          )}
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.messageId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`w-full px-3 py-3 rounded-2xl text-sm font-medium shadow-sm ${
                    msg.role === "user"
                      ? "bg-zinc-200 text-zinc-800 rounded-br-sm ml-5"
                      : "bg-white text-slate-700 border border-slate-200 rounded-bl-sm mr-5"
                  }`}
                >
                  <span className="text-zinc-800 text-sm pb-1 px-1 block">
                    {msg.role === "user" ? "You" : "AI Assistant"}
                  </span>
                  <hr className="border-t border-zinc-400" />
                  {msg.role === "user" ? (
                    <p className="pt-1 text-base font-normal leading-6 px-1">
                      {msg.content}
                    </p>
                  ) : (
                    <div className="flex flex-col pt-1 px-1">
                      {parseAssistantContent(msg.content).map((section, i) => (
                        <div
                          className={`border-0 border-b border-zinc-200 py-4 ${i == 0 ? "pt-1" : ""}`}
                          key={i}
                        >
                          {section?.title ? (
                            <h2 className="text-black text-xl">{section.title}</h2>
                          ) : null}
                          <div className="text-md font-normal leading-6 mt-2">
                            <ReactMarkdown>{section?.markdownSubSummary || ""}</ReactMarkdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {sending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-end gap-2"
              >
                <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center text-white">
                  <Bot size={14} />
                </div>
                <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl text-sm text-slate-500 shadow-sm">
                  Thinking…
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-slate-100 bg-white flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Continue this conversation..."
            className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 outline-none font-medium"
          />
          <button
            onClick={sendMessage}
            disabled={sending}
            className="w-12 h-12 bg-slate-800 text-white rounded-2xl flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center text-white">
          <History size={18} />
        </div>
        <div>
          <h2 className="font-bold text-slate-900">Chat History</h2>
          <p className="text-xs text-slate-400">Slate Browser</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2 bg-slate-50">
        {loadingSessions && (
          <p className="text-center text-sm text-slate-400 pt-8">Loading chats…</p>
        )}

        {!loadingSessions && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2 text-slate-400">
            <MessageSquare size={28} />
            <p className="text-sm font-medium">No conversations yet</p>
          </div>
        )}

        {sessions.map((session) => (
          <button
            key={session.session_id}
            onClick={() => openSession(session.session_id)}
            className="w-full text-left p-4 bg-white border border-slate-200 rounded-2xl hover:border-slate-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900 truncate text-sm">
                {session.session_id}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide shrink-0">
                {session.message_count} msgs
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {formatTimestamp(session.last_message_at)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
