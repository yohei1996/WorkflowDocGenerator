import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
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
    <div className="space-y-8">
      {manual.content.map((step, index) => (
        <div key={index} className="space-y-4">
          <pre className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          {JSON.stringify(step, null, 2)}
        </pre>
          <h2 className="text-xl font-semibold">
            {index + 1}. {step.headline}
          </h2>
          
          {step.screenshotPath && (
            <div className="w-full max-w-xs">
              <Card className="p-2">
                <img
                  src={step.screenshotPath}
                  alt={`Step ${index + 1}`}
                  className="rounded-lg w-full h-full object-cover aspect-video"
                />
              </Card>
            </div>
          )}
          
          <p className="text-gray-700 dark:text-gray-300">
            {step.description}
          </p>
        </div>
      ))}
      
      <div className="hidden">
        <div className="prose max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ 
            __html: marked(markdown) 
          }} />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Manual
        </Button>
      </div>
    </div>
  );
}
