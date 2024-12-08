import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";
import * as path from "path";

// Ensure screenshots directory exists
const screenshotsDir = "screenshots";
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
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
    return Array(count).fill("/sample.png");
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
      const outputPath = path.join(
        screenshotsDir, 
        `${path.parse(videoPath).name}-${Date.now()}-${offset}.jpg`
      );

      await new Promise<void>((resolve, reject) => {
        ffmpeg(videoPath)
          .screenshots({
            timestamps: [time],
            filename: path.basename(outputPath),
            folder: screenshotsDir,
            size: "1280x720"
          })
          .on("end", () => {
            console.log(`Generated screenshot: ${outputPath}`);
            resolve();
          })
          .on("error", (err) => {
            console.error(`Screenshot generation error: ${err.message}`);
            reject(err);
          });
      });

      screenshots.push(outputPath);
    }

    return screenshots;
  } catch (error) {
    console.error("Screenshot generation failed:", error);
    throw error;
  }
}
