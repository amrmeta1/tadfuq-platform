"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n/context";
import { useToast } from "@/components/ui/toast";
import { getTenantId } from "@/lib/api/client";
import { FileText, Trash2 } from "lucide-react";

interface Document {
  id: string;
  title: string;
  type: string;
  status: string;
  created_at: string;
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" {
  switch (status) {
    case "ready":
    case "indexed":
      return "default";
    case "processing":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
}

function getStatusLabel(status: string, isAr: boolean): string {
  switch (status) {
    case "ready":
    case "indexed":
      return isAr ? "مفهرس" : "Indexed";
    case "processing":
      return isAr ? "جاري المعالجة" : "Processing";
    case "failed":
      return isAr ? "فشل" : "Failed";
    default:
      return status;
  }
}

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function DocumentsList() {
  const { locale, dir } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tenantId = getTenantId();
  const isAr = locale === "ar";

  const { data: documentsData, isLoading } = useQuery({
    queryKey: ["documents", tenantId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/tenants/${tenantId}/documents`);
      if (!response.ok) throw new Error("Failed to fetch documents");
      return response.json();
    },
    enabled: !!tenantId,
  });

  const documents: Document[] = documentsData?.documents || [];

  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(
        `/api/v1/tenants/${tenantId}/documents/${documentId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast({
        title: isAr ? "تم حذف المستند" : "Document deleted",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["documents", tenantId] });
    },
    onError: () => {
      toast({
        title: isAr ? "فشل حذف المستند" : "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (documentId: string) => {
    if (confirm(isAr ? "هل أنت متأكد من حذف هذا المستند؟" : "Are you sure you want to delete this document?")) {
      deleteMutation.mutate(documentId);
    }
  };

  return (
    <Card dir={dir}>
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="text-lg font-semibold">
          {isAr ? "المستندات المفهرسة" : "Indexed Documents"}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              {isAr ? "لا توجد مستندات بعد" : "No documents yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isAr ? "ابدأ برفع مستند أعلاه" : "Start by uploading a document above"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(doc.created_at, locale)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={getStatusVariant(doc.status)}>
                    {getStatusLabel(doc.status, isAr)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(doc.id)}
                    disabled={deleteMutation.isPending}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
