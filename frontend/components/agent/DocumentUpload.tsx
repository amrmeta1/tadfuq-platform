"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import { useToast } from "@/components/ui/toast";
import { getTenantId } from "@/lib/api/client";
import { UploadCloud, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

function getFileType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "docx") return "docx";
  if (ext === "txt") return "txt";
  return "unknown";
}

export function DocumentUpload() {
  const { locale, dir } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tenantId = getTenantId();
  const isAr = locale === "ar";
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);
      formData.append("type", getFileType(file.name));

      const response = await fetch(`/api/v1/tenants/${tenantId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: isAr ? "تم رفع المستند بنجاح" : "Document uploaded successfully",
        description: isAr ? "بدأت الفهرسة." : "Indexing started.",
        variant: "success",
      });
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["documents", tenantId] });
    },
    onError: () => {
      toast({
        title: isAr ? "فشل رفع المستند" : "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const fileType = getFileType(file.name);
      
      if (fileType === "unknown") {
        toast({
          title: isAr ? "نوع ملف غير مدعوم" : "Unsupported file type",
          description: isAr ? "يرجى رفع PDF أو DOCX أو TXT" : "Please upload PDF, DOCX, or TXT",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      uploadMutation.mutate(file);
    }
  }, [toast, isAr, uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: uploadMutation.isPending,
  });

  return (
    <Card dir={dir}>
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="text-lg font-semibold">
          {isAr ? "رفع مستند" : "Upload Document"}
        </CardTitle>
        <CardDescription>
          {isAr ? "PDF, DOCX, أو TXT" : "PDF, DOCX, or TXT"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer",
            isDragActive && "border-primary bg-primary/5",
            !isDragActive && "border-muted-foreground/25 hover:border-muted-foreground/50",
            uploadMutation.isPending && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3 text-center">
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                <p className="text-sm text-muted-foreground">
                  {isAr ? "جاري الرفع..." : "Uploading..."}
                </p>
                {selectedFile && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    <span>{selectedFile.name}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <UploadCloud className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {isDragActive
                      ? isAr ? "أفلت الملف هنا" : "Drop file here"
                      : isAr 
                        ? "اسحب وأفلت المستندات المالية أو مستندات الخزينة هنا"
                        : "Drag & drop financial or treasury documents here"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isAr ? "أو" : "or"}
                  </p>
                </div>
                <Button variant="outline" type="button">
                  {isAr ? "اختر ملف" : "Choose File"}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
