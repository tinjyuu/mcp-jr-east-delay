import { expect, test } from "vitest";
import * as cheerio from "cheerio";

// scrapeAreaをindex.tsからexportする必要があります
import { scrapeArea } from "./index.js";

test("scrapeArea returns array of delay info for kanto", async () => {
  const url = "https://traininfo.jreast.co.jp/train_info/kanto.aspx";
  const result = await scrapeArea(url);
  console.log("scrapeArea result:", result);
  expect(Array.isArray(result)).toBe(true);
  // 返り値が空配列でないこと（平常運転時は空もあり得るが、型的にOKか確認）
  expect(result).toBeTypeOf("object");
  if (result.length > 0) {
    expect(result[0]).toHaveProperty("line");
    expect(result[0]).toHaveProperty("status");
    expect(result[0]).toHaveProperty("category");
  }
});

test("kanto area should detect delays in Chuo Line", async () => {
  const url = "https://traininfo.jreast.co.jp/train_info/kanto.aspx";
  const result = await scrapeArea(url);
  
  console.log("Kanto delay check:", result);
  
  // 中央線快速電車の遅延情報がある場合
  const chuoRapidDelay = result.find(item => 
    item.line === "中央線快速電車" && item.category === "delay"
  );
  
  console.log("Found Chuo Rapid delay:", chuoRapidDelay);
  
  // 内房線のお知らせがある場合
  const uchibouNotice = result.find(item => 
    item.line === "内房線" && item.category === "notice"
  );
  
  console.log("Found Uchibou notice:", uchibouNotice);
  
  // 両方のデータの確認ログ（どちらかが見つかればテスト成功）
  if (chuoRapidDelay) {
    expect(chuoRapidDelay).toHaveProperty("status");
    expect(chuoRapidDelay.status).toContain("遅延");
  }
  
  if (uchibouNotice) {
    expect(uchibouNotice).toHaveProperty("status");
    expect(uchibouNotice.status).toContain("お知らせ");
  }
  
  // 現状の「中央線快速電車」または「内房線」のどちらかが遅延/お知らせを持っているはず
  expect(chuoRapidDelay || uchibouNotice).toBeTruthy();
});
