import type { Express } from "express";
import multer from "multer";
import { db } from "../db";
import { manuals } from "@db/schema";
import { analyzeVideo } from "./services/gemini";
import { generateScreenshots } from "./services/video";
import { eq } from "drizzle-orm";

const storage = multer.diskStorage({
  destination: "uploads/",
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

export function registerRoutes(app: Express) {
  // Upload video and analyze
  app.post("/api/upload", upload.single("video"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No video uploaded" });
      }

      const analysis = await analyzeVideo(req.file.path);
      
      const manual = await db.insert(manuals).values({
        title: req.file.originalname,
        videoPath: req.file.path,
        content: analysis,
      }).returning();

      res.json(manual[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
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
