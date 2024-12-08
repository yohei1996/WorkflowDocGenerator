import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeVideo(videoPath: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const prompt = `あなたはマニュアル作成AIエージェントです。
動画の内容からマークダウン形式のマニュアルを生成するために情報が入ったjsonを生成してください。
手順ごとに見出しを作成して操作内容を説明してください。
見出しごとに画面スクショを取るタイミングの時間(hh:mm)を記載してください。`;

  try {
    const result = await model.generateContent([prompt, videoPath]);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to analyze video");
  }
}
