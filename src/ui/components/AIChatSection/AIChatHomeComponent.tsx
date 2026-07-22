import React from "react";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

import { Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../hooks/useTypedSelector";
import { detectRendering, getMinifyText } from "../../helpers/webPage.helper";
import { v4 as uuidv4 } from "uuid";
import {
  toggleThirdSection,
  setSelectedChatSessionId,
} from "../../features/layoutSlice";
interface IMessage {
  messageId: string;
  role: RoleType;
  content: string;
  rawHTML: string;
  formControlsInHTMLPage: SerializedFormControl[];
}
const thinkingMessages = [
  "Working on your request…",
  "Something is in motion…",
  "A few things are happening…",
  "Things are moving along…",
  "Your request is in progress…",
  "Work is underway…",
  "Something's happening…",
  "It's coming together…",
  "Progress is happening…",
];

function parseAssistantContent(content: string): BrowserSummarySection[] {
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [{ title: "", markdownSubSummary: content }];
  } catch {
    return [{ title: "", markdownSubSummary: content }];
  }
}

export default function AIChatHomeComponent() {
  const dispatch = useAppDispatch();
  const { tabs, activeTabId } = useAppSelector((state) => state.tabs);
  // A fresh chat session id, generated once per mount. This is deliberately
  // independent of activeTabId: reopening the "ai_chat" tab always remounts
  // this component (see ThirdSection), so every visit starts its own new
  // conversation/session instead of continuing whatever this tab last chatted
  // about. activeTabId is still used separately to fetch the page's DOM.
  const [chatSessionId] = useState(() => uuidv4());
  // Always starts blank: this view is only for kicking off a brand new
  // conversation. Once a message is sent, the user is redirected into
  // AIChatHistoryComponent to view/continue that specific chat.
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingText, setThinkingText] = useState(thinkingMessages[0]);

  const intervalRef = useRef<any>(null);

  const startThinkingAnimation = () => {
    let i = 0;
    intervalRef.current = setInterval(() => {
      i = (i + 1) % thinkingMessages.length;
      setThinkingText(thinkingMessages[i]);
    }, 2300);
  };

  const stopThinkingAnimation = () => {
    clearInterval(intervalRef.current);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessageId = uuidv4();

    const userMessage: IMessage = {
      messageId: userMessageId,
      role: "user",
      content: input,
      rawHTML: "",
      formControlsInHTMLPage: [],
    };
    const messagesCopy = [...messages];

    messagesCopy.push(userMessage);

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
          const updateMsg: IMessage = {
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
        id: activeTabId || "",
        chatSessionId,
        chatHistory: updatedMessages,
      };
      setLoading(true);
      startThinkingAnimation();
      try {
        const result = await window.browserWebPageApi.webPageAutomate(payload);

        // success (200)
        if (result.status) {
          const aiMessageId = uuidv4();
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

          // This session now has a real conversation in it — hand off to the
          // history view for this specific chat so it continues one-to-one
          // from here instead of re-fetching page DOM on every turn.
          dispatch(setSelectedChatSessionId(chatSessionId));
          dispatch(toggleThirdSection("ai_chat_history"));
        } else {
          const aiMessageId = uuidv4();
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
        // error handling (400/500/network)
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
        setLoading(false);
        stopThinkingAnimation();
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center text-white">
          <Bot size={18} />
        </div>
        <div>
          <h2 className="font-bold text-slate-900">Browser Assistant</h2>
          <p className="text-xs text-slate-400">Slate Browser</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-4 bg-slate-50">
        <AnimatePresence>
          {messages.map((msg, idx) => {
            const user_content = msg.role == "user" ? msg.content : "";
            const ai_content: BrowserSummarySection[] =
              msg.role == "assistant" ? parseAssistantContent(msg.content) : [];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* {msg.role === "ai" && (
                <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center text-white">
                  <Bot size={14} />
                </div>
              )} */}

                <div
                  className={`w-full px-3 py-3 rounded-2xl text-sm font-medium shadow-sm ${
                    msg.role === "user"
                      ? "bg-zinc-200 text-zinc-800 rounded-br-sm  ml-5"
                      : "bg-white text-slate-700 border border-slate-200 rounded-bl-sm mr-5"
                  }`}
                >
                  {msg.role === "user" ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-zinc-800 text-sm pb-1 px-1">
                        You
                      </span>
                      <hr className="border-t border-zinc-400" />
                      <p className="pt-1 text-base font-normal leading-6 px-1">
                        {user_content}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 ">
                      <span className="text-zinc-800 text-sm pb-1 px-1">
                        AI Assistant
                      </span>
                      <hr className="border-t border-zinc-400" />
                      <div className="flex flex-col pt-1 px-1">
                        {ai_content.map(
                          (subSection: BrowserSummarySection, i: number) => {
                            return (
                              <div
                                className={`border-0 border-b border-zinc-200 py-4 ${i == 0 ? "pt-1" : ""}`}
                                key={i}
                              >
                                <h2 className="text-black text-xl ">
                                  {subSection?.title || ""}
                                </h2>
                                <div className="text-md font-normal leading-6 mt-2">
                                  <ReactMarkdown>
                                    {subSection?.markdownSubSummary || ""}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* {msg.role === "user" && (
                <div className="w-8 h-8 bg-slate-200 rounded-xl flex items-center justify-center text-slate-600">
                  <User size={14} />
                </div>
              )} */}
              </motion.div>
            );
          })}

          {/* AI Thinking Bubble */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-end gap-2"
            >
              <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center text-white">
                <Bot size={14} />
              </div>

              <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl text-sm text-slate-500 shadow-sm">
                {thinkingText}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-100 bg-white flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 outline-none font-medium"
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="w-12 h-12 bg-slate-800 text-white rounded-2xl flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
