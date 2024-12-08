import { GoogleGenerativeAI } from "@google/generative-ai";
import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs/promises";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function extractFrames(videoPath: string, frameCount = 5): Promise<string[]> {
  const outputDir = "uploads/frames";
  await fs.mkdir(outputDir, { recursive: true });
  
  const framePaths: string[] = [];
  
  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on('end', (stdout: string | null, stderr: string | null) => resolve(void 0))
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
  // If USE_DUMMY_DATA is set, return dummy manual steps
  if (process.env.USE_DUMMY_DATA === "true") {
    console.log("Using dummy data for video analysis");
    return [
      {
        time: "00:00",
        headline: "アプリケーションの起動",
        description: "デスクトップ上のアイコンをダブルクリックし、アプリケーションを起動します。",
        screenshotPath: "uploads/frames/00_00.png"
      },
      {
        time: "00:05",
        headline: "ログイン画面",
        description: "ユーザー名とパスワードを入力して、ログインボタンをクリックします。",
        screenshotPath: "uploads/frames/00_00.png"
      },
      {
        time: "00:10",
        headline: "メインメニュー",
        description: "左側のメニューから必要な機能を選択します。",
        screenshotPath: "uploads/frames/00_00.png"
      },
      {
        time: "00:15",
        headline: "設定画面",
        description: "歯車アイコンをクリックして設定画面を開きます。",
        screenshotPath: "uploads/frames/00_00.png"
      },
      {
        time: "00:20",
        headline: "完了",
        description: "設定が完了したら、保存ボタンをクリックして変更を適用します。",
        screenshotPath: "uploads/frames/00_00.png"
      }
    ];
  }

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
    const model = genAI.getGenerativeModel({ model: "gemini-exp-1206" });

    const prompt = `あなたはマニュアル作成AIエージェントです。
与えられた動画から、マニュアルを生成するための情報を時間と対応させて生成してください。
手順ごとにheadlineを作成し。操作内容を説明してください。
headlineに対応する時間をtime(mm:ssの形式)として記載してください。
出力は英語でお願いします。

以下の形式のJSONを生成してください：
[
  {
    time: "00:00",
    headline: "$operation screeen title",
    description: "$operation detail",
  },
  ...
]`;

    const result = await model.generateContent([prompt, ...generativeParts]);
    const response = await result.response;
    const text = response.text()
    .replace(/```json|```/g, '') // JSONブロックの削除
    .trim() // 余分な空白の削除
    
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
