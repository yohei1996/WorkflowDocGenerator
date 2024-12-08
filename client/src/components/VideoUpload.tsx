import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Cloud, File, FileVideo } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAvailableVideos } from "../lib/api";

interface VideoUploadProps {
  onUpload: (file: File | string) => void;
  disabled?: boolean;
}

export default function VideoUpload({ onUpload, disabled }: VideoUploadProps) {
  const [videos, setVideos] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string>("");

  useEffect(() => {
    getAvailableVideos().then(setVideos).catch(console.error);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/quicktime": [".mov"],
    },
    multiple: false,
    disabled,
  });

  const handleSelectVideo = (value: string) => {
    setSelectedVideo(value);
    onUpload(value);
  };

  return (
    <div className="space-y-4">
      {videos.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">既存の動画を選択:</label>
          <Select
            value={selectedVideo}
            onValueChange={handleSelectVideo}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="動画を選択" />
            </SelectTrigger>
            <SelectContent>
              {videos.map((video) => (
                <SelectItem key={video} value={video}>
                  <div className="flex items-center gap-2">
                    <FileVideo className="h-4 w-4" />
                    <span>{video}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="text-sm font-medium">新しい動画をアップロード:</div>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors",
          isDragActive && "border-primary",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-2">
          {isDragActive ? (
            <>
              <Cloud className="h-10 w-10 text-primary animate-bounce" />
              <p>ここにドロップ...</p>
            </>
          ) : (
            <>
              <File className="h-10 w-10 text-muted-foreground" />
              <p>動画をドロップするか、クリックして選択</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
