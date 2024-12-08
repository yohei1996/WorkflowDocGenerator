import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { generateScreenshots } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ScreenshotSelectorProps {
  manualId: number;
  time: string;
  selected?: string;
  onSelect: (path: string) => void;
  onTimeChange?: (newTime: string) => void;
}

export default function ScreenshotSelector({
  manualId,
  time,
  selected,
  onSelect,
  onTimeChange,
}: ScreenshotSelectorProps) {
  const { data: screenshots, isLoading } = useQuery({
    queryKey: ["screenshots", manualId, time],
    queryFn: () => generateScreenshots(manualId, time),
    enabled: Boolean(time && time.match(/^\d{2}:\d{2}$/)),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (screenshots && screenshots.length > 0 && !selected) {
      onSelect(screenshots[0]);
    }
  }, [screenshots, selected, onSelect]);

  // タイムスタンプを1秒進める/戻す
  const adjustTime = (currentTime: string, seconds: number): string => {
    // 現在の時間が正しい形式でない場合は "00:00" を返す
    if (!currentTime.match(/^\d{2}:\d{2}$/)) {
      return "00:00";
    }
    
    const [minutes, secs] = currentTime.split(':').map(Number);
    let totalSeconds = minutes * 60 + secs + seconds;
    
    // 負の値にならないようにする
    totalSeconds = Math.max(0, totalSeconds);
    
    const newMinutes = Math.floor(totalSeconds / 60);
    const newSeconds = totalSeconds % 60;
    
    return `${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`;
  };

  const handleTimeInput = (value: string) => {
    if (!onTimeChange) return;

    // MM:SS形式のバリデーション
    if (value.match(/^\d{2}:\d{2}$/)) {
      const [minutes, seconds] = value.split(':').map(Number);
      if (minutes < 60 && seconds < 60) {
        onTimeChange(value);
        onSelect("");
      }
    }
  };

  if (selected) {
    return (
      <div className="w-full max-w-xs space-y-2">
        <div className="relative">
          <Card className="p-2">
            <img
              src={selected}
              alt="Selected screenshot"
              className="rounded-lg w-full h-full object-cover aspect-video"
            />
          </Card>
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg p-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                if (time && onTimeChange) {
                  const newTime = adjustTime(time, -1);
                  onTimeChange(newTime);
                  onSelect("");
                }
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Input
              value={time}
              onChange={(e) => handleTimeInput(e.target.value)}
              className="w-20 h-6 text-center text-sm"
              placeholder="MM:SS"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                if (time && onTimeChange) {
                  const newTime = adjustTime(time, 1);
                  onTimeChange(newTime);
                  onSelect("");
                }
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-xs flex items-center justify-center p-4">
        <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="w-full max-w-xs p-4 text-center text-muted-foreground">
        {time ? "スクリーンショットを生成できませんでした" : "タイムスタンプを入力してください"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {screenshots.map((path, index) => (
          <Card 
            key={index} 
            className="p-1 cursor-pointer hover:ring-2 hover:ring-primary relative" 
            onClick={() => onSelect(path)}
          >
            <img
              src={path}
              alt={`Screenshot ${index + 1}`}
              className="rounded-lg w-full h-full object-cover aspect-video"
            />
          </Card>
        ))}
      </div>
      <div className="text-sm text-muted-foreground text-center">
        クリックしてスクリーンショットを選択
      </div>
    </div>
  );
}
