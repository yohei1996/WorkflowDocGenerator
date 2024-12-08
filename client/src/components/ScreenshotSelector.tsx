import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { generateScreenshots } from "../lib/api";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Loader2 } from "lucide-react";

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
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: screenshots } = useQuery({
    queryKey: ["screenshots", manualId, time],
    queryFn: () => generateScreenshots(manualId, time),
    enabled: Boolean(time),
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    await refetch();
    setIsGenerating(false);
  };

  return (
    <div className="space-y-4">
      {selected ? (
        <div className="w-full max-w-xs">
          <img
            src={selected}
            alt="Selected screenshot"
            className="rounded-lg border-2 border-primary"
          />
        </div>
      ) : screenshots ? (
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
      ) : null}
    </div>
  );
}
