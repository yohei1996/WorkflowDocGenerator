import ffmpeg from "fluent-ffmpeg";

import * as fs from "fs";

// Ensure screenshots directory exists
const screenshotsDir = "screenshots";
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Copy the sample image to screenshots directory
const sampleImagePath = "image.png";
if (fs.existsSync(sampleImagePath)) {
  fs.copyFileSync(sampleImagePath, `${screenshotsDir}/sample.png`);
}

export async function generateScreenshots(
  videoPath: string,
  timestamp: string,
  count = 5
): Promise<string[]> {
  // If USE_DUMMY_DATA is true, return predefined screenshot paths
  if (process.env.USE_DUMMY_DATA === "true") {
    return Array(count).fill(`${screenshotsDir}/sample.png`);
  }

  const screenshots: string[] = [];
  
  // Convert timestamp to seconds
  const parts = timestamp.split(":");
  const seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
  
  // Generate screenshots at -2, -1, 0, +1, +2 seconds from the timestamp
  const offsets = [-2, -1, 0, 1, 2];
  
  for (const offset of offsets) {
    const time = Math.max(0, seconds + offset);
    const outputPath = `${screenshotsDir}/${Date.now()}-${offset}.jpg`;
    
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [time],
          filename: outputPath,
          size: "1280x720"
        })
        .on("end", () => resolve())
        .on("error", (err) => reject(err));
    });
    
    screenshots.push(outputPath);
  }
  
  return screenshots;
}
