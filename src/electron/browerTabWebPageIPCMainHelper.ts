import { ipcMain, WebContentsView } from "electron";
import { v4 as uuidv4 } from "uuid";

import type { BrowserWindow as BrowserWindowType } from "electron";
import { pathToFileURL } from "url";
import { detectRendering } from "./helpers/webPage.helper.js";
import {
  mainOpenAIAgent,
  listAIChatSessions,
  getAIChatSessionHistory,
} from "./helpers/openAIAgent.helper.js";

const tabs = new Map<string, Tab>();
let activeTabId: string | null = null;

export function browserTabWebPageIPCMainHelper(
  mainWindow: BrowserWindowType,
  views: Map<string, WebContentsView>,
  wcToTab: Map<number, string>,
) {
  // ipcMain.handle("get_html_from_view", async (event, id: string) => {
  //   if (!id) return;
  //   let view = views.get(id);
  //   if (!view) return;

  //   const html: string =
  //     (await view.webContents.executeJavaScript(
  //       "document.documentElement.outerHTML",
  //     )) || "";

  //   return html;
  // });

  ipcMain.handle("get_html_from_view", async (event, id: string) => {
    if (!id) return;
    let view = views.get(id);
    if (!view) return;

    const response: SnapshotResponse = await view.webContents
      .executeJavaScript(`
(() => {
  try {
    function serializeElement(el) {
      const tag = el.tagName.toLowerCase();

      if (tag === 'input') {
        const input = el;

        const base = {
          tag: 'input',
          type: input.type,
          name: input.name,
          id: input.id,
          value: input.value,
          checked: input.checked,
          disabled: input.disabled,
          required: input.required,
        };

        if (input.type === 'file') {
          return {
            ...base,
            files: Array.from(input.files || []).map(file => ({
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified,
            })),
            filesLength: input.files?.length || 0,
            hasFiles: (input.files?.length || 0) > 0,
          };
        }

        return base;
      }

      if (tag === 'textarea') {
        return {
          tag: 'textarea',
          name: el.name,
          id: el.id,
          value: el.value,
        };
      }

      if (tag === 'select') {
        return {
          tag: 'select',
          name: el.name,
          id: el.id,
          value: el.value,
          selectedOptions: Array.from(el.selectedOptions).map(o => ({
            value: o.value,
            text: o.text,
          })),
        };
      }

      return null;
    }

    const formControls = Array.from(
      document.querySelectorAll('input, textarea, select')
    )
      .map(serializeElement)
      .filter(Boolean);

    return {
      success: true,
      data: {
        html: document.documentElement.outerHTML,
        formControls,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error
          ? error.message
          : String(error),

        stack: error instanceof Error
          ? error.stack
          : undefined,
      },
    };
  }
})()
`);
    return response;
  });

  ipcMain.handle(
    "web_page_automate",
    async (event, payload: WebPageAutomatePayload) => {
      const { id, chatSessionId, chatHistory } = payload;

      const lastChatMessage = chatHistory[chatHistory?.length - 1];

      const formControls = JSON.stringify(
        lastChatMessage.formControlsInHTMLPage,
      );

      const refractorData = await detectRendering(
        lastChatMessage?.rawHTML || "",
      );

      // `id` is the browser tab id (used elsewhere for multi-tab targeting);
      // the AI conversation is tracked separately under chatSessionId so a
      // fresh "ai_chat" visit always starts its own history entry.
      const result = await mainOpenAIAgent(chatSessionId, lastChatMessage.content, {
        rawDOM: refractorData.minifiedRawHtml,
        formControls,
      });

      return result;
    },
  );

  ipcMain.handle("ai_chat:list_sessions", async () => {
    return listAIChatSessions();
  });

  ipcMain.handle(
    "ai_chat:get_history",
    async (event, sessionId: string) => {
      return getAIChatSessionHistory(sessionId);
    },
  );

  ipcMain.handle(
    "ai_chat:send_message",
    async (event, payload: AIChatSendMessagePayload) => {
      return mainOpenAIAgent(payload.sessionId, payload.query);
    },
  );
}

const executeBrowserAutomationActions = async (
  views:  Map<string, WebContentsView>,
  id:string,
  pageTask: BrowserWebPagePayload[],
) => {
  // Sort in ascending order by the step field
  pageTask.sort((a: any, b: any) => a.step - b.step);

  for (let i = 0; i < pageTask.length; i++) {
    const task = pageTask[i];
    const safeSelector = JSON.stringify(task.selector);

    switch (task.eventName) {
      case "getElementPosition":
        // Usually this returns a value, but you can ignore or log it
        await getElementPosition(views, id, safeSelector);
        break;

      case "click":
        console.log("i am clicking task: ", task);
        await click(views, id, safeSelector);
        break;

      case "rightClick":
        await rightClick(views, id, safeSelector);
        break;

      case "mousehover":
        await mousehover(views, id, safeSelector);
        break;

      case "type":
        console.log("tying", { id, task });
        await type(views, id, safeSelector, task?.text ||"");
        break;

      case "keyPress":
        console.log("i am pressing key hi ha ha : ", { id, task });
        keyPress(views, id, task.key ||"");
        break;

      case "scroll":
        scroll(views, id, task.deltaY || 0);
        break;

      default:
        console.warn(`Unknown eventName: ${task.eventName}`);
        break;
    }
  }
};

async function getElementPosition(
  views: Map<string, WebContentsView>,
  id: string,
  selector: string,
) {
  if (!id) return;
  let view = views.get(id);
  if (!view) return;

  return await view.webContents.executeJavaScript(`
    (() => {
      try {
        const el = document.querySelector(${selector});

        if (!el) return null;

        const rect = el.getBoundingClientRect();

        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      } catch (err) {
        console.error("querySelector error:", err);
        return { error: err.message };
      }
    })()
  `);
}

export async function click(
  views: Map<string, WebContentsView>,
  id: string,
  selector: string,
) {
  if (!id) return;
  let view = views.get(id);
  if (!view) return;

  const pos = await getElementPosition(views, id, selector);

  if (!pos) return;

  view.webContents.sendInputEvent({
    type: "mouseDown",
    x: pos.x,
    y: pos.y,
    button: "left",
    clickCount: 1,
  });

  view.webContents.sendInputEvent({
    type: "mouseUp",
    x: pos.x,
    y: pos.y,
    button: "left",
    clickCount: 1,
  });
}

export async function rightClick(
  views: Map<string, WebContentsView>,
  id: string,
  selector: string,
) {
  if (!id) return;
  let view = views.get(id);
  if (!view) return;

  const pos = await getElementPosition(views, id, selector);
  if (!pos) return;

  view.webContents.sendInputEvent({
    type: "mouseDown",
    x: pos.x,
    y: pos.y,
    button: "right",
    clickCount: 1,
  });

  view.webContents.sendInputEvent({
    type: "mouseUp",
    x: pos.x,
    y: pos.y,
    button: "right",
    clickCount: 1,
  });
}

export async function mousehover(
  views: Map<string, WebContentsView>,
  id: string,
  selector: string,
) {
  if (!id) return;
  let view = views.get(id);
  if (!view) return;
  const pos = await getElementPosition(views, id, selector);
  if (!pos) return;

  view.webContents.sendInputEvent({
    type: "mouseMove",
    x: pos.x,
    y: pos.y,
  });
}

export async function type(
  views: Map<string, WebContentsView>,
  id: string,
  selector: string,
  text: string,
) {
  if (!id) return;
  let view = views.get(id);
  if (!view) return;
  await view.webContents.executeJavaScript(`
    (() => {
      const el =  document.querySelector(${selector});
      if(!el) return;
      el.focus();
    })()
  `);

  for (const char of text) {
    view.webContents.sendInputEvent({
      type: "char",
      keyCode: char,
    });
  }
}

export function keyPress(
  views: Map<string, WebContentsView>,
  id: string,
  key: string,
) {
  if (!id) return;
  let view = views.get(id);
  if (!view) return;
  view.webContents.sendInputEvent({
    type: "keyDown",
    keyCode: key,
  });

  view.webContents.sendInputEvent({
    type: "keyUp",
    keyCode: key,
  });
}

export function scroll(
  views: Map<string, WebContentsView>,
  id: string,
  deltaY: number,
) {
  if (!id) return;
  let view = views.get(id);
  if (!view) return;
  view.webContents.sendInputEvent({
    type: "mouseWheel",
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: deltaY,
  });
}
