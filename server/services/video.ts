import ffmpeg from "fluent-ffmpeg";

export async function generateScreenshots(
  videoPath: string,
  timestamp: string,
  count = 5
): Promise<string[]> {
  const screenshots: string[] = [];
  
  // Convert timestamp to seconds
  const parts = timestamp.split(":");
  const seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
  
  // Generate screenshots at -2, -1, 0, +1, +2 seconds from the timestamp
  const offsets = [-2, -1, 0, 1, 2];
  
  for (const offset of offsets) {
    const time = Math.max(0, seconds + offset);
    const outputPath = `screenshots/${Date.now()}-${offset}.jpg`;
    
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
