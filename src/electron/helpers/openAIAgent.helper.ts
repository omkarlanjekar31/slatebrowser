import "dotenv/config";
import { Agent, run, AgentInputItem } from "@openai/agents";
import AIChatDatabase from "../db/aichatdb.js";
import type {
  ChatMessageType,
  ChatSessionSummaryType,
} from "../db/aichatdb.model.js";

const chatDb = new AIChatDatabase();

export function listAIChatSessions(): ChatSessionSummaryType[] {
  return chatDb.listSessions();
}

export function getAIChatSessionHistory(sessionId: string): ChatMessageType[] {
  return chatDb.getFullHistory(sessionId);
}

const aiAgent = new Agent({
  name: "Browser chat assistant",
  instructions: `
You are a helpful AI assistant embedded inside a web browser.

Each user turn may include a snapshot of the current page's DOM and its form
controls as extra context. Use that context to answer questions about the
page or help the user with what they're trying to do on it. Always reply
with plain conversational text.
`,
});

// Extracts a queryable role/content pair from an agent history item. Message items
// (user/assistant/system) carry `role` + `content`; tool-call/result items only carry
// `type`, so that is used as the fallback "role" for storage/inspection purposes.
function describeHistoryItem(item: AgentInputItem): {
  role: string;
  content: string | null;
} {
  const role = (item as any).role ?? (item as any).type ?? "unknown";

  const rawContent = (item as any).content;
  let content: string | null = null;
  if (typeof rawContent === "string") {
    content = rawContent;
  } else if (Array.isArray(rawContent)) {
    content =
      rawContent
        .map((part: any) => part?.text ?? "")
        .filter(Boolean)
        .join("\n") || null;
  }

  return { role, content };
}

export type WebPageDOMContext = {
  rawDOM?: string;
  formControls?: string;
};

export async function mainOpenAIAgent(
  sessionId: string,
  q = "",
  domContext?: WebPageDOMContext,
): Promise<AIChatSheetsAutomateCalledResponseType> {
  // Load only the most recent turns for this session instead of keeping full
  // history in memory, so the input given to the model stays bounded.
  const priorHistory = chatDb.toHistoryItems(
    chatDb.getRecentHistory(sessionId, 50),
  ) as AgentInputItem[];

  // Every turn carries the query alongside a snapshot of the page it was asked
  // about, so later turns in the same session stay grounded in what the user saw.
  const contentParts = [`User query: ${q}`];
  if (domContext?.rawDOM) {
    contentParts.push(`Current page DOM snapshot:\n${domContext.rawDOM}`);
  }
  if (domContext?.formControls) {
    contentParts.push(
      `Current page form controls:\n${domContext.formControls}`,
    );
  }

  const userItem: AgentInputItem = {
    role: "user",
    content: contentParts.join("\n\n"),
  };
  const inputHistory = [...priorHistory, userItem];

  const result = await run(aiAgent, inputHistory);

  // Persist only what's new: the user turn just sent plus whatever the agent
  // generated in response (assistant messages, tool calls, tool results).
  const newItems = result.history.slice(priorHistory.length);
  const hasDomContext = Boolean(domContext?.rawDOM || domContext?.formControls);
  chatDb.addMessages(
    sessionId,
    newItems.map((item, index) => {
      const described = describeHistoryItem(item);
      // Only the first new item is the user's own turn (the rest are the agent's
      // response). Store its plain query and page snapshot in their own columns so
      // the UI can show just what the user typed, without the DOM blob mixed in.
      const isUserTurn = index === 0 && described.role === "user";

      return {
        ...described,
        raw_item: item,
        user_query: isUserTurn ? q : null,
        dom_context: isUserTurn && hasDomContext ? JSON.stringify(domContext) : null,
      };
    }),
  );

  return {
    status: true,
    ai_response: [{ title: "", markdownSubSummary: result.finalOutput || "" }],
  };
}
