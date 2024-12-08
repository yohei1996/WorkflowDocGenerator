import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Cloud, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoUploadProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

export default function VideoUpload({ onUpload, disabled }: VideoUploadProps) {
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

  return (
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
            <p>Drop the video here...</p>
          </>
        ) : (
          <>
            <File className="h-10 w-10 text-muted-foreground" />
            <p>Drag and drop a video here, or click to select</p>
          </>
        )}
      </div>
    </div>
  );
}
