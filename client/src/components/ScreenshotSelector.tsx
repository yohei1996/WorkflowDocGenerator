import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { generateScreenshots } from "../lib/api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ScreenshotSelectorProps {
  manualId: number;
  time: string;
  selected?: string;
  onSelect: (path: string) => void;
}

export default function ScreenshotSelector({
  manualId,
  time,
  selected,
  onSelect,
}: ScreenshotSelectorProps) {
  const { data: screenshots, isLoading } = useQuery({
    queryKey: ["screenshots", manualId, time],
    queryFn: () => generateScreenshots(manualId, time),
    enabled: Boolean(time && time.match(/^\d{2}:\d{2}$/)),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (screenshots && screenshots.length > 0 && !selected) {
      onSelect(screenshots[0]);
    }
  }, [screenshots, selected, onSelect]);

  if (selected) {
    return (
      <div className="w-full max-w-xs">
        <img
          src={selected}
          alt="Selected screenshot"
          className="rounded-lg border-2 border-primary w-full h-full object-cover aspect-video"
        />
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
      <Carousel className="w-full max-w-xs">
        <CarouselContent>
          {screenshots.map((path, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-video">
                <img
                  src={path}
                  alt={`Screenshot ${index + 1}`}
                  className="rounded-lg cursor-pointer border-2 border-transparent hover:border-primary w-full h-full object-cover"
                  onClick={() => onSelect(path)}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="text-sm text-muted-foreground text-center">
        クリックしてスクリーンショットを選択
      </div>
    </div>
  );
}
