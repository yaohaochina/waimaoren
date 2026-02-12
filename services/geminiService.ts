import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, MarketAnalysisData } from "../types";

const apiKey = process.env.API_KEY;

export const analyzeMarket = async (keyword: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prompt designed to extract both a detailed report and JSON data for charts
  const prompt = `
    作为一名资深的国际贸易与市场分析专家，请利用 Google Search 对关键词 "${keyword}" 进行全球市场分析。
    
    目标听众：打算将业务拓展到海外的中国外贸企业。

    请执行以下操作：
    1. 分析全球范围内对 "${keyword}" 搜索热度最高的 5 个国家/地区。
    2. 分析当前的市场趋势、季节性变化以及潜在的消费者痛点。
    3. 列出该产品在国际市场上的主要竞争对手或知名品牌（3-5个）。
    4. 针对中国企业，给出具体的出海建议（如目标市场选择、营销策略等）。

    请严格按照以下格式输出：

    [PART 1: REPORT]
    (这里请用 Markdown 格式撰写详细的分析报告，语言为中文。请包含小标题，条理清晰，重点突出。)

    [PART 2: DATA]
    (请在报告结束后，提供一个 JSON 代码块，包含用于可视化的数据。
    格式必须如下：
    \`\`\`json
    {
      "topCountries": [
        {"name": "Country A", "value": 95}, 
        {"name": "Country B", "value": 80},
        ... (top 5 countries with relative interest score 0-100)
      ],
      "competitors": ["Brand A", "Brand B", "Brand C"],
      "suggestedAction": "简短的一句话核心建议"
    }
    \`\`\`
    )
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.5,
      },
    });

    const fullText = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Extract JSON data
    let structuredData: MarketAnalysisData | null = null;
    const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/);
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        structuredData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse JSON from model response", e);
      }
    }

    // Clean up report text (remove the JSON block part to avoid duplication in display)
    const markdownReport = fullText.replace(/\[PART 2: DATA\][\s\S]*$/, '').trim();

    return {
      markdownReport,
      structuredData,
      groundingChunks
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const findBuyersInRegion = async (keyword: string, region: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });

  // Use Maps Grounding to find potential physical businesses
  const prompt = `Find top wholesale distributors or importers for "${keyword}" in ${region}. List them with their details.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });
    return response.text || "No specific buyer data found.";
  } catch (e) {
    console.error(e);
    return "Error fetching buyer data.";
  }
};
