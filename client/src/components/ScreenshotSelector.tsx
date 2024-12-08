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

  const { data: screenshots, refetch } = useQuery({
    queryKey: ["screenshots", manualId, time],
    queryFn: () => generateScreenshots(manualId, time),
    enabled: false,
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    await refetch();
    setIsGenerating(false);
  };

  return (
    <div className="space-y-4">
      {!screenshots ? (
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !time}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Screenshots"
          )}
        </Button>
      ) : (
        <Carousel className="w-full max-w-xs">
          <CarouselContent>
            {screenshots.map((path, index) => (
              <CarouselItem key={index}>
                <img
                  src={path}
                  alt={`Screenshot ${index + 1}`}
                  className={`rounded-lg cursor-pointer border-2 ${
                    selected === path ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => onSelect(path)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )}
    </div>
  );
}
