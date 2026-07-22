import OpenAI from "openai";
import dotenv from "dotenv";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

dotenv.config();

const BrowserWebPagePayloadSchema = z.object({
  id: z.string(),
  eventName: z.enum([
    "getElementPosition",
    "click",
    "rightClick",
    "mousehover",
    "type",
    "keyPress",
    "scroll",
  ]),
  step: z.number(),
  selector: z.string(),
  text: z.string(),
  key: z.string(),
  deltaY: z.number(),
});

const BrowserWebPagePayloadArraySchema = z.object({
  payloads: z.array(BrowserWebPagePayloadSchema),
});

const endpoint = process.env.OPENAI_API_ENDPOINT_URL;
const modelName = "gpt-5-mini";
const deployment_name = "gpt-5-mini";
const api_key = process.env.OPENAI_API_KEY;
const client = new OpenAI({
  baseURL: endpoint,
  apiKey: api_key,
});

export async function runOpenAIllm(
  developerPrompt: string,
  userPrompt: string,
) {
  try {
    const completion = await client.responses.create({
      model: deployment_name,
      instructions: developerPrompt,
      input: userPrompt,
    });

    console.log(completion.output_text);
    return completion.output_text;
  } catch (err: any) {
    console.log("CONSOLE ERROR OPEN AI ", err);
    throw new Error(err);
  }
}

export async function runOpenAIllmJSONOutput(
  developerPrompt: string,
  userPrompt: string,
) {
  try {
    const completion = await client.responses.parse({
      model: deployment_name,
      input: [
        { role: "system", content: developerPrompt },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      text: {
        format: zodTextFormat(BrowserWebPagePayloadArraySchema, "pageTask"),
      },
    });

    console.log(completion.output_parsed);
    return completion.output_parsed;
  } catch (err: any) {
    console.log("CONSOLE ERROR OPEN AI ", err);
    throw new Error(err);
  }
}

export const getWebPageTaskDeveloperPrompt = (rawHTML: string) => {
  const prompt = `
You are Senior step by step task creator.
You are given a raw html body tag and user query.
So convert the user query to structured step by step task to automate website.



type WebEventName =
  | "getElementPosition"
  | "click"
  | "rightClick"
  | "mousehover"
  | "type"
  | "keyPress"
  | "scroll";

type BrowserWebPagePayload = {
  eventName: WebEventName;
  step: number;
  selector: string;
  text?: string;
  key?: string;
  deltaY?: number;
};

Required fields : eventName, selector

For selector field: Identify the selector from raw html body tab for example if field required "type" eventType 
then find the input field selector for what where user want to type 
for example search input,filling forms like signIn,signUp(email,password,first name,etc)
use your judgement to find selector by placeholder, tag,id name,name attribute,etc

For text field (optional):
if user query has intention of "type" eventName then capture the text the user wants to enter in input field

For key field(optional):
if user query has intention of "keyPress" eventName then capture the char/key the user wants to press

For deltaY field (optional):
if user query has intention of scroll up and down


For example User ask: I want to get best mobile phones under 15000 rs

Output format :
[
      {
        id: "task-1",
        eventName: "type",
        step: 1,
        selector: "#inputBox",
        text: "best mobile phone under 15000 rs",
        key: "",
        deltaY: 0,
      }
];

--------------RAW HTML BODY TAG-----------------
${rawHTML}

-------------END of RAW HTML BODY TAG ----------------
`;

  return prompt;
};

