import type { Manual, ManualStep } from "./types";

const API_BASE = "/api";

export async function getAvailableVideos(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/videos`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch videos");
  }

  return response.json();
}

export async function uploadVideo(file: File | string): Promise<Manual> {
  const formData = new FormData();
  if (typeof file === 'string') {
    formData.append("existingVideo", file);
  } else {
    formData.append("video", file);
  }

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return response.json();
}

export async function getManual(id: number): Promise<Manual> {
  const response = await fetch(`${API_BASE}/manuals/${id}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch manual");
  }

  return response.json();
}

export async function generateScreenshots(
  manualId: number,
  time: string
): Promise<string[]> {
  const response = await fetch(`${API_BASE}/screenshots/${manualId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ time }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate screenshots");
  }

  return response.json();
}

export async function updateManual(
  id: number,
  content: ManualStep[],
  markdownContent?: string
): Promise<Manual> {
  const response = await fetch(`${API_BASE}/manuals/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, markdownContent }),
  });

  if (!response.ok) {
    throw new Error("Failed to update manual");
  }

  return response.json();
}
