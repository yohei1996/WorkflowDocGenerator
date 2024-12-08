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
  const { data: screenshots } = useQuery({
    queryKey: ["screenshots", manualId, time],
    queryFn: () => generateScreenshots(manualId, time),
    enabled: Boolean(time),
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
          className="rounded-lg border-2 border-primary"
        />
      </div>
    );
  }

  if (!screenshots || screenshots.length === 0) {
    return null;
  }

  return (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {screenshots.map((path, index) => (
          <CarouselItem key={index}>
            <img
              src={path}
              alt={`Screenshot ${index + 1}`}
              className="rounded-lg cursor-pointer border-2 border-transparent hover:border-primary"
              onClick={() => onSelect(path)}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
