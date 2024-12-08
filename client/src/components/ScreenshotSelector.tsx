import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { generateScreenshots } from "../lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "./ui/card";

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
  const [inputTime, setInputTime] = useState(time);

  useEffect(() => {
    setInputTime(time);
  }, [time]);

  const { data: screenshots, isLoading, refetch } = useQuery({
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

  const adjustTime = (timestamp: string, direction: 'prev' | 'next'): string => {
    const [minutes, secs] = timestamp.split(':').map(Number);
    let totalSeconds = minutes * 60 + secs + (direction === 'next' ? 1 : -1);
    totalSeconds = Math.max(0, totalSeconds);
    
    const newMinutes = Math.floor(totalSeconds / 60);
    const newSeconds = totalSeconds % 60;
    
    const formattedTime = `${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`;
    return formattedTime;
  };

  const handleTimeInput = (value: string) => {
    setInputTime(value);
    
    // 入力値のバリデーションとフォーマット
    const timeMatch = value.match(/^(\d{0,2}):?(\d{0,2})$/);
    if (timeMatch) {
      let [_, minutes, seconds] = timeMatch;
      minutes = minutes.padStart(2, '0');
      seconds = seconds.padStart(2, '0');
      
      const mins = parseInt(minutes, 10);
      const secs = parseInt(seconds, 10);
      
      if (mins < 60 && secs < 60 && onTimeChange) {
        const formattedTime = `${minutes}:${seconds}`;
        onTimeChange(formattedTime);
        onSelect("");
        refetch();
      }
    }
  };

  const handleTimeAdjust = (direction: 'prev' | 'next') => {
    if (!time || !onTimeChange) return;
    
    const newTime = adjustTime(time, direction);
    onTimeChange(newTime);
    onSelect("");
    refetch();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleTimeAdjust('next');
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleTimeAdjust('prev');
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
              onClick={() => handleTimeAdjust('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Input
              value={inputTime}
              onChange={(e) => handleTimeInput(e.target.value)}
              onBlur={(e) => e.preventDefault()}
              onKeyDown={handleKeyDown}
              className="w-20 h-6 text-center text-sm"
              placeholder="MM:SS"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleTimeAdjust('next')}
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
