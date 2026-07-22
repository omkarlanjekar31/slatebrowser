import OpenAI from "openai";
import dotenv from "dotenv";
import { z } from "zod";
import { ZodType } from "zod";

import { zodToJsonSchema } from "zod-to-json-schema";
dotenv.config();

export const BrowserWebPagePayloadSchema = z.object({
  eventName: z.enum([
    "getElementPosition",
    "click",
    "rightClick",
    "mousehover",
    "type",
    "keyPress",
    "scroll",
  ]),
  step: z.number().min(0),

  selector: z.string().nullable().optional(),
  text: z.string().nullable().optional(),
  key: z.string().nullable().optional(),
  deltaY: z.number().nullable().optional(),
});

export type BrowserWebPagePayload = z.infer<typeof BrowserWebPagePayloadSchema>;

export const BrowserSummarySectionSchema = z.object({
  title: z.string(),
  markdownSubSummary: z.string(),
});

export const BrowserWebPagePayloadArraySchema = z.object({
  payloads: z.array(BrowserWebPagePayloadSchema),
  summary: z.array(BrowserSummarySectionSchema),
});

const endpoint = process.env.OPENAI_API_ENDPOINT_URL;
const modelName = "gpt-5-mini";
const deployment_name = "gpt-5-mini";
const api_key = process.env.OPENAI_API_KEY;
const client = new OpenAI({
  baseURL: endpoint,
  apiKey: api_key,
});

import { detectRendering } from "./webPage.helper.js";


const tools= [
  {
    type: "function",
    name: "plan_actions",
    description: "Generate browser automation steps from current DOM",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        payloads: {
          type: "array",
          items: {
            type: "object",
            properties: {
              eventName: {
                type: "string",
                enum: [
                  "getElementPosition",
                  "click",
                  "rightClick",
                  "mousehover",
                  "type",
                  "keyPress",
                  "scroll",
                ],
              },

              step: {
                type: "number",
                minimum: 0,
              },

              selector: {
                type: "string",
              },

              text: {
                type: "string",
              },

              key: {
                type: "string",
              },

              deltaY: {
                type: "number",
              },
            },
            required: ["eventName", "step"],
            additionalProperties: false,
          },
        },

        summary: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
              },
              markdownSubSummary: {
                type: "string",
              },
            },
            required: ["title", "markdownSubSummary"],
            additionalProperties: false,
          },
        },
      },

      required: ["payloads", "summary"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "request_dom_update",
    description: "Request updated DOM snapshot",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        reason: { type: "string" },
      },
      required: ["reason"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "mark_done",
    description: "Mark automation as completed",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string" },
      },
      required: ["summary"],
      additionalProperties: false,
    },
  },
] satisfies OpenAI.Responses.Tool[];

export type ToolName = typeof tools[number]["name"];

export async function reACTAgent<T extends OpenAI.Responses.ResponseTextConfig>(
  sytemPrompt: string,
  prompts: OpenAI.Responses.ResponseInput,
  outFormat: T,
) {
  try {
    let context: OpenAI.Responses.ResponseInput = [
      { role: "system", content: sytemPrompt },
    ];

    context.concat(prompts);
    const response = await client.responses.parse({
      model: deployment_name,
      input: context,
      text: outFormat,
      tools:tools
    });

    return response;
  } catch (err: any) {
    console.log("CONSOLE ERROR OPEN AI ", err);
    throw new Error(err);
  }
}



const SYSTEM_PROMPT: string = `
You operate in a ReAct (Reasoning + Acting) loop for browser automation.

You do NOT assume full task completion in a single response.

Instead, you must:

1. THINK about current DOM state
2. ACT by generating valid automation payloads
3. STOP when DOM change is required
4. WAIT for updated DOM before continuing
5. REPEAT until task is complete

---

# EXECUTION MODES

You can operate in 3 modes:

## 1. ACTION MODE
Use when required elements exist in current DOM snapshot.

Return:
- payloads
- summary

## 2. WAIT-FOR-DOM MODE
Use when:
- search was executed
- page navigation occurred
- UI changed
- selector is not available in current DOM

Return:
{
  "payloads": [],
  "summary": [
    {
      "title": "Waiting for Page Update",
      "markdownSubSummary": "The interface is updating. Next actions will continue after the updated DOM is received."
    }
  ]
}
`;
