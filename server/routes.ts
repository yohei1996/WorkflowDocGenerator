import type { Express, Request } from "express";
import multer from "multer";
import { db } from "../db";
import { manuals } from "@db/schema";
import { analyzeVideo } from "./services/gemini";
import { generateScreenshots } from "./services/video";
import { eq } from "drizzle-orm";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

import * as fs from "fs";

// Ensure uploads directory exists
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "video/quicktime") {
      cb(null, true);
    } else {
      cb(new Error("Only MOV files are allowed"));
    }
  }
});

import express from "express";

export function registerRoutes(app: Express) {
  app.use('/frames', express.static('uploads/frames'));
  // Upload video and analyze
  app.post("/api/upload", upload.single("video"), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No video uploaded" });
      }

      console.log("Video uploaded:", req.file.path);
      
      const analysis = await analyzeVideo(req.file.path);
      console.log("Video analysis completed");
      
      const manual = await db.insert(manuals).values({
        title: req.file.originalname,
        videoPath: req.file.path,
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
      res.status(500).json({ error: error.message });
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
      res.status(500).json({ error: error.message });
    }
  });
}
