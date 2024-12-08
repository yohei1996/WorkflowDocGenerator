import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getManual, updateManual } from "../lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ManualEditor from "../components/ManualEditor";
import ManualPreview from "../components/ManualPreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ManualStep } from "../lib/types";

export default function Editor() {
  const { id } = useParams();
  const manualId = parseInt(id);
  const { toast } = useToast();

  const { data: manual, isLoading } = useQuery({
    queryKey: ["manual", manualId],
    queryFn: () => getManual(manualId),
  });

  const mutation = useMutation({
    mutationFn: ({ content, markdownContent }: { content: ManualStep[], markdownContent?: string }) => 
      updateManual(manualId, content, markdownContent),
    onSuccess: () => {
      toast({
        title: "Saved successfully",
        description: "Your changes have been saved",
      });
    },
    onError: (error) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!manual) {
    return <div>Manual not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{manual.title}</h1>
      
      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit">
          <ManualEditor
            manual={manual}
            onSave={(content) => mutation.mutate({ content })}
          />
        </TabsContent>
        
        <TabsContent value="preview">
          <ManualPreview
            manual={manual}
            onSave={(content, markdownContent) => 
              mutation.mutate({ content, markdownContent })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
