import { LMStudioClient } from "@lmstudio/sdk";
export async function LMStudioInit() {
  const client = new LMStudioClient();
  console.log("Model Loading...");
  const model = await client.llm.model("qwen/qwen3-1.7b");
  console.log("Result fetching. Please wait...");
  const result = await model.respond("Write a TypeScript hello world example.");
  console.log("Completed Fetching.");
  console.log(result.content);
}
LMStudioInit();
