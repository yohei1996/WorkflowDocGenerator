import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";
import * as path from "path";

// Ensure frames directory exists
const framesDir = "uploads/frames";
if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
}

function parseTimestamp(timestamp: string): number {
  const parts = timestamp.split(":");
  if (parts.length !== 2) {
    throw new Error("Invalid timestamp format. Expected format: MM:SS");
  }
  
  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);
  
  if (isNaN(minutes) || isNaN(seconds) || seconds >= 60) {
    throw new Error("Invalid timestamp values");
  }
  
  return minutes * 60 + seconds;
}

export async function generateScreenshots(
  videoPath: string,
  timestamp: string,
  count = 5
): Promise<string[]> {
  if (process.env.USE_DUMMY_DATA === "true") {
    return Array(count).fill("/frames/sample.png");
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
