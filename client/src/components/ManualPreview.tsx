import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Manual, ManualStep } from "../lib/types";
import { marked } from "marked";

interface ManualPreviewProps {
  manual: Manual;
  onSave: (content: ManualStep[], markdownContent: string) => void;
}

export default function ManualPreview({ manual, onSave }: ManualPreviewProps) {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    generateMarkdown();
  }, [manual.content]);

  const generateMarkdown = () => {
    let md = `# ${manual.title}\n\n`;

    manual.content.forEach((step, index) => {
      md += `## ${index + 1}. ${step.headline}\n\n`;
      
      if (step.screenshotPath) {
        // フレームパスをそのまま使用
        md += `![Step ${index + 1}](${step.screenshotPath})\n\n`;
      }
      
      md += `${step.description}\n\n`;
    });

    setMarkdown(md);
  };

  const handleSave = () => {
    onSave(manual.content, markdown);
  };

  return (
    <div className="space-y-4">
      <div className="prose max-w-none dark:prose-invert">
        <div dangerouslySetInnerHTML={{ 
          __html: marked(markdown) 
        }} />
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Manual
        </Button>
      </div>
    </div>
  );
}
