import { GoogleGenerativeAI } from "@google/generative-ai";
import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs/promises";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function extractFrames(videoPath: string, frameCount = 5): Promise<string[]> {
  const outputDir = "uploads/frames";
  await fs.mkdir(outputDir, { recursive: true });
  
  const framePaths: string[] = [];
  
  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .on('end', resolve)
      .on('error', reject)
      .screenshots({
        count: frameCount,
        folder: outputDir,
        filename: `frame-%i.jpg`,
        size: '1280x720'
      });
  });
  
  // List and sort the generated frames
  const files = await fs.readdir(outputDir);
  return files
    .filter(file => file.startsWith('frame-'))
    .sort()
    .map(file => `${outputDir}/${file}`);
}

async function fileToGenerativePart(path: string) {
  const imageData = await fs.readFile(path);
  return {
    inlineData: {
      data: imageData.toString('base64'),
      mimeType: 'image/jpeg'
    }
  };
}

export async function analyzeVideo(videoPath: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  try {
    // Extract frames from the video
    const framePaths = await extractFrames(videoPath);
    
    // Convert frames to Gemini-compatible format
    const generativeParts = await Promise.all(
      framePaths.map(fileToGenerativePart)
    );

    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const prompt = `あなたはマニュアル作成AIエージェントです。
これから見せる画像は動画から抽出したフレームです。
これらの画像から、マニュアルを生成するためのJSONを生成してください。
手順ごとに見出しを作成して操作内容を説明してください。
見出しごとに画面スクショを取るタイミングの時間(hh:mm)を記載してください。

以下の形式のJSONを生成してください：
[
  {
    "time": "00:00",
    "headline": "手順の見出し",
    "description": "手順の詳細な説明"
  }
]`;

    const result = await model.generateContent([prompt, ...generativeParts]);
    const response = await result.response;
    const text = response.text();
    
    // Clean up frames
    await Promise.all(framePaths.map(path => fs.unlink(path)));
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      throw new Error("Invalid JSON response from Gemini");
    }
  } catch (error) {
    console.error("Video analysis error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to analyze video"
    );
  }
}
