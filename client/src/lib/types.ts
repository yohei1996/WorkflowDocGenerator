export interface ManualStep {
  time: string;
  headline: string;
  description: string;
  screenshotPath?: string;
}

export interface Manual {
  id: number;
  title: string;
  videoPath: string;
  content: ManualStep[];
  markdownContent?: string;
  createdAt: string;
  updatedAt: string;
}
