import axios, { AxiosError } from "axios";
import * as cheerio from "cheerio";
import UserAgent from "user-agents";


export type DetectRenderingType = {
  isLikelySSRorSSG: boolean | string;
  nextJsData: boolean | string;
  heuristic: string;
  websitebodyContent: any;
  errorMessageFromWebsite?: string;
  statusCodeFromWebsite?: number | string;
  metadata?: WebsiteMetaData | undefined;
  rawBodyHtml: string;
};
export const getMetaData = ($: cheerio.CheerioAPI) => {
  try {
    // helper
    const getMeta = (name: string, attr = "content") =>
      $(`meta[${name}]`).attr(attr) || null;

    // title resolution order
    const title =
      getMeta('property="og:title"') ||
      getMeta('name="twitter:title"') ||
      $("title").text().trim() ||
      null;

    // description resolution order
    const description =
      getMeta('name="description"') ||
      getMeta('property="og:description"') ||
      getMeta('name="twitter:description"') ||
      null;

    // image resolution order
    const imageUrl =
      getMeta('property="og:image"') || getMeta('name="twitter:image"') || null;

    const metadata: WebsiteMetaData = { title, description, imageUrl };
    return metadata;
  } catch (error: any) {
    console.log(error);
  }
};

export async function detectRendering(
  rawHTML: string,
): Promise<DetectRenderingType> {
  try {
    const $ = cheerio.load(rawHTML);
    const metadata = getMetaData($);
    // Remove script and style tags inside body
    $("body svg").remove();
    $("body script").remove();
    $("body style").remove();
    const bodyHtml = $("body").html();
    const bodyText = $("body").text().trim();
    const results: any = [];
    $("body *").each((_i, el) => {
      const tag = el.tagName?.toLowerCase();
      if (!tag) return;

      // Get only text *directly* inside this element
      let directText = "";
      $(el)
        .contents()
        .each((_, node) => {
          if (node.type === "text") {
            directText += node.data.trim();
          }
        });

      directText = directText.trim();
      if (directText) {
        results.push({
          type: tag,
          content: directText,
        });
      }
    });
    const hasTextContent = $("p, h1, h2, li, article").length > 0;
    const nextData = $("#__NEXT_DATA__").html();
    const resultString = JSON.stringify(results);
    const minifyText = getMinifyText(resultString);
    return {
      isLikelySSRorSSG: hasTextContent,
      nextJsData: nextData ? JSON.parse(nextData) : null,
      heuristic: hasTextContent
        ? "server pre-rendered content present"
        : "likely CSR or JS-filled content",
      websitebodyContent: minifyText || ["No content in body tag"],
      statusCodeFromWebsite: "",
      metadata: metadata,
      rawBodyHtml: bodyHtml || "N/A",
    };
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response) {
      // Get the HTTP status code
      const statusCode = err.response.status;
      return {
        isLikelySSRorSSG: "N/A",
        nextJsData: "N/A",
        heuristic: "N/A",
        websitebodyContent: ["N/A content in body tag"],
        errorMessageFromWebsite: err.response.statusText,
        statusCodeFromWebsite: statusCode,
        rawBodyHtml: "",
      };
    } else {
      return {
        isLikelySSRorSSG: "N/A",
        nextJsData: "N/A",
        heuristic: "N/A",
        websitebodyContent: ["N/A content in body tag"],
        errorMessageFromWebsite: err.message,
        statusCodeFromWebsite: "N/A",
        rawBodyHtml: "",
      };
    }
  }
}

export function getMinifyText(str: string) {
  return str
    .replace(/\s+/g, " ") // collapse all whitespace into a single space
    .trim(); // remove leading/trailing spaces
}
