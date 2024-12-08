import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const manuals = pgTable("manuals", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  videoPath: text("video_path").notNull(),
  content: jsonb("content").$type<{
    time: string;
    headline: string;
    description: string;
    screenshotPath?: string;
  }[]>(),
  markdownContent: text("markdown_content"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertManualSchema = createInsertSchema(manuals);
export const selectManualSchema = createSelectSchema(manuals);
export type InsertManual = z.infer<typeof insertManualSchema>;
export type Manual = z.infer<typeof selectManualSchema>;
