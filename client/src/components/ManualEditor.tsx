import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ScreenshotSelector from "./ScreenshotSelector";
import type { Manual, ManualStep } from "../lib/types";

interface ManualEditorProps {
  manual: Manual;
  onSave: (content: ManualStep[]) => void;
}

export default function ManualEditor({ manual, onSave }: ManualEditorProps) {
  const [steps, setSteps] = useState<ManualStep[]>(manual.content);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleStepUpdate = (index: number, updates: Partial<ManualStep>) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    
    // タイムスタンプが更新された場合、スクリーンショットをリセット
    if ('time' in updates) {
      newSteps[index].screenshotPath = undefined;
    }
    
    setSteps(newSteps);
  };

  const handleScreenshotSelect = (index: number, path: string) => {
    handleStepUpdate(index, { screenshotPath: path });
  };

  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div
          key={index}
          className="grid grid-cols-[1fr,400px] gap-6"
        >
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-4">
              <Input
                value={step.headline}
                onChange={(e) => handleStepUpdate(index, { headline: e.target.value })}
                placeholder="Headline"
                className="flex-1"
              />
            </div>
            
            <Textarea
              value={step.description}
              onChange={(e) => handleStepUpdate(index, { description: e.target.value })}
              placeholder="Description"
            />
          </div>

          <div className="space-y-4">
            <ScreenshotSelector
              manualId={manual.id}
              time={step.time}
              selected={step.screenshotPath}
              onSelect={(path) => handleScreenshotSelect(index, path)}
              onTimeChange={(newTime) => handleStepUpdate(index, { time: newTime })}
            />
          </div>
        </div>
      ))}
      
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setSteps([...steps, {
            time: "",
            headline: "",
            description: "",
          }])}
        >
          Add Step
        </Button>
        
        <Button onClick={() => onSave(steps)}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
