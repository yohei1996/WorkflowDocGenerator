import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";
import * as path from "path";

// Ensure frames directory exists
const framesDir = "uploads/frames";
if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
}

function parseTimestamp(timestamp: string): number {
  // MM:SS形式かチェック
  if (!/^\d{2}:\d{2}$/.test(timestamp)) {
    throw new Error("Invalid timestamp format. Expected format: MM:SS (e.g., 05:30)");
  }
  
  const [minutes, seconds] = timestamp.split(":").map(part => parseInt(part, 10));
  
  if (isNaN(minutes) || isNaN(seconds) || seconds >= 60 || minutes >= 60) {
    throw new Error("Invalid timestamp values. Minutes and seconds must be between 00-59");
  }
  
  return minutes * 60 + seconds;
}

export async function generateScreenshots(
  videoPath: string,
  timestamp: string,
  count = 1
): Promise<string[]> {
  // フレームを生成して保存
  try {
    const baseSeconds = parseTimestamp(timestamp);
    const screenshots: string[] = [];
    
    // タイムスタンプをMM_SS形式に変換
    const minutes = Math.floor(baseSeconds / 60);
    const seconds = baseSeconds % 60;
    const timeStr = `${minutes.toString().padStart(2, '0')}_${seconds.toString().padStart(2, '0')}`;
    
    // ファイル名を時間に基づいて生成
    const filename = `${timeStr}.png`;
    const outputPath = path.join(framesDir, filename);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [baseSeconds],
          filename: filename,
          folder: framesDir,
          size: "1280x720"
        })
        .on("end", () => {
          console.log(`Generated frame: ${outputPath}`);
          resolve();
        })
        .on("error", (err) => {
          console.error(`Frame generation error: ${err.message}`);
          reject(err);
        });
    });

    screenshots.push(`/frames/${filename}`);
    return screenshots;
  } catch (error) {
    console.error("Screenshot generation failed:", error);
    throw error;
  }

  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  try {
    const baseSeconds = parseTimestamp(timestamp);
    const screenshots: string[] = [];
    const offsets = [-2, -1, 0, 1, 2];

    for (const offset of offsets) {
      const time = Math.max(0, baseSeconds + offset);
      const filename = `${path.parse(videoPath).name}-${Date.now()}-${offset}.jpg`;
      const outputPath = path.join(framesDir, filename);

      await new Promise<void>((resolve, reject) => {
        ffmpeg(videoPath)
          .screenshots({
            timestamps: [time],
            filename: filename,
            folder: framesDir,
            size: "1280x720"
          })
          .on("end", () => {
            console.log(`Generated frame: ${outputPath}`);
            resolve();
          })
          .on("error", (err) => {
            console.error(`Frame generation error: ${err.message}`);
            reject(err);
          });
      });

      // フレームへのURLパスを返す
      screenshots.push(`/frames/${filename}`);
    }

    return screenshots;
  } catch (error) {
    console.error("Screenshot generation failed:", error);
    throw error;
  }
}
