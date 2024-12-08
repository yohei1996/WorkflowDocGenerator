import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import VideoUpload from "../components/VideoUpload";
import { useToast } from "@/hooks/use-toast";
import { uploadVideo } from "../lib/api";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (file: string | File) => {
    if (typeof file === 'string') return;
    
    setIsUploading(true);
    try {
      const manual = await uploadVideo(file);
      toast({
        title: "Upload successful", 
        description: "Redirecting to editor...",
      });
      navigate(`/edit/${manual.id}`);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Upload failed",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Video Manual Generator
      </h1>
      
      <Card className="max-w-2xl mx-auto p-6">
        <div className="space-y-4">
          <VideoUpload
            onUpload={handleUpload}
            disabled={isUploading}
          />
          
          {isUploading && (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing video...</span>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p>Supported format: MOV</p>
            <p>Maximum file size: 100MB</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
