import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as cheerio from "cheerio";
// Map of area names to JR East train info page paths
const AREA_URLS = {
    kanto: "https://traininfo.jreast.co.jp/train_info/kanto.aspx",
    tohoku: "https://traininfo.jreast.co.jp/train_info/tohoku.aspx",
    shinetsu: "https://traininfo.jreast.co.jp/train_info/shinetsu.aspx",
    shinkansen: "https://traininfo.jreast.co.jp/train_info/shinkansen.aspx",
    choykori: "https://traininfo.jreast.co.jp/train_info/chyokyori.aspx",
};
/**
 * Scrape delay information from a JR East area page.
 * Returns array of DelayInfo without the area property (added later).
 */
export async function scrapeArea(url) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch ${url}: ${res.status}`);
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    const results = [];
    $(".rosenBox").each((i, el) => {
        const lineName = $(el).find(".rosen_nameBox_inn .name").text().trim();
        const status = $(el).find(".rosen_infoBox .status").text().trim();
        const detail = $(el).find(".rosen_infoBox .status_Text").text().trim();
        if (!lineName || !status)
            return;
        // 平常運転はスキップ
        if (/平常運転|Normal operation/.test(status))
            return;
        let category = "other";
        if (/遅延|Delay/.test(status))
            category = "delay";
        else if (/運休|Suspension|Suspend/.test(status))
            category = "suspension";
        else if (/お知らせ|Notice/.test(status))
            category = "notice";
        results.push({
            line: lineName,
            status: detail ? `${status} ${detail}` : status,
            category,
        });
    });
    return results;
}
async function main() {
    const server = new McpServer({
        name: "jr-east-delay",
        version: "1.0.0",
    });
    // Tool: getDelays
    server.tool("getDelays", {
        area: z.enum(["kanto", "tohoku", "shinetsu", "shinkansen"]).optional(),
    }, async ({ area }) => {
        const areas = (area ? [area] : Object.keys(AREA_URLS));
        const allResults = [];
        console.log(`[getDelays] Starting request for areas: ${areas.join(', ')}`);
        for (const a of areas) {
            try {
                const url = AREA_URLS[a];
                console.log(`[getDelays] Fetching delays for area: ${a} from ${url}`);
                const res = await scrapeArea(url);
                console.log(`[getDelays] Results for ${a}:`, JSON.stringify(res, null, 2));
                res.forEach((r) => allResults.push({ area: a, ...r }));
            }
            catch (err) {
                console.error(`[getDelays] Error fetching ${a}:`, err);
                allResults.push({ area: a, line: "", status: "", category: "other", error: err.message });
            }
        }
        console.log(`[getDelays] Total results: ${allResults.length}`);
        console.log(`[getDelays] Has delay info:`, allResults.some(r => r.category === "delay"));
        console.log(`[getDelays] Full results:`, JSON.stringify(allResults, null, 2));
        const text = allResults.length > 0
            ? allResults
                .map((r) => r.error ? `[${r.area}] ERROR: ${r.error}` : `[${r.area}] ${r.line}: ${r.status}`)
                .join("\n")
            : "No delays found.";
        console.log(`[getDelays] Final response text:`, text.substring(0, 100) + (text.length > 100 ? '...' : ''));
        return {
            content: [
                {
                    type: "text",
                    text,
                },
            ],
        };
    });
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
await main();
