import express, { type Express } from "express";
import path from "path";
import fs from "fs/promises";
import { mkdir } from "fs/promises";
import multer from "multer";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { manuals } from "@db/schema";
import { analyzeVideo } from "./services/gemini";
import { generateScreenshots } from "./services/video";
import type { Multer } from "multer";

interface MulterRequest extends express.Request {
  file?: Express.Multer.File;
}

// マルチパートフォームデータを処理するためのmulterの設定
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

export async function registerRoutes(app: Express) {
  // アップロードディレクトリの設定
  const framesPath = path.join(process.cwd(), 'uploads/frames');
  const uploadsPath = path.join(process.cwd(), 'uploads');
  
  // ディレクトリの作成
  await mkdir(uploadsPath, { recursive: true });
  await mkdir(framesPath, { recursive: true });
  app.use('/frames', express.static(framesPath));
  
  // Get list of available videos
  app.get("/api/videos", async (req, res) => {
    try {
      const files = await fs.readdir(uploadsPath);
      const videos = files.filter(file => file.endsWith('.mov'));
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to list videos" });
    }
  });

  // Upload video and analyze
  app.post("/api/upload", upload.single("video"), async (req: MulterRequest, res) => {
    try {
      let videoPath: string;
      let title: string;
      
      if (req.body.existingVideo) {
        videoPath = path.join(uploadsPath, req.body.existingVideo);
        title = req.body.existingVideo;
      } else if (req.file) {
        videoPath = req.file.path;
        title = req.file.originalname;
        console.log("Video uploaded:", videoPath);
      } else {
        return res.status(400).json({ error: "No video provided" });
      }

      // フレームディレクトリをクリーンアップ
      try {
        const frames = await fs.readdir(framesPath);
        await Promise.all(
          frames.map(frame => fs.unlink(path.join(framesPath, frame)))
        );
        console.log("Cleaned up frames directory");
      } catch (error) {
        console.error("Failed to cleanup frames:", error);
      }
      
      const analysis = await analyzeVideo(videoPath);
      console.log("Video analysis completed");
      
      const manual = await db.insert(manuals).values({
        title,
        videoPath,
        content: analysis,
      }).returning();

      console.log("Manual created:", manual[0].id);
      res.json(manual[0]);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process video" 
      });
    }
  });

  // Get manual by ID
  app.get("/api/manuals/:id", async (req, res) => {
    const manual = await db.query.manuals.findFirst({
      where: eq(manuals.id, parseInt(req.params.id))
    });
    
    if (!manual) {
      return res.status(404).json({ error: "Manual not found" });
    }
    
    res.json(manual);
  });

  // Generate screenshots for a time
  app.post("/api/screenshots/:id", async (req, res) => {
    try {
      const manual = await db.query.manuals.findFirst({
        where: eq(manuals.id, parseInt(req.params.id))
      });
      
      if (!manual) {
        return res.status(404).json({ error: "Manual not found" });
      }

      const { time } = req.body;
      const screenshots = await generateScreenshots(manual.videoPath, time);
      res.json(screenshots);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate screenshots" 
      });
    }
  });

  // Update manual content
  app.put("/api/manuals/:id", async (req, res) => {
    try {
      const { content, markdownContent } = req.body;
      const manual = await db.update(manuals)
        .set({ content, markdownContent, updatedAt: new Date() })
        .where(eq(manuals.id, parseInt(req.params.id)))
        .returning();
      
      res.json(manual[0]);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to update manual"
      });
    }
  });
}
