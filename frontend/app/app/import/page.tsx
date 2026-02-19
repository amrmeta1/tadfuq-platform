"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Upload, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useTenant } from "@/lib/hooks/use-tenant";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { importBankCSV, createBankAccount } from "@/lib/api/ingestion-api";
import type { CSVImportResult, CreateBankAccountInput } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ImportPage() {
  const { t } = useI18n();
  const { currentTenant } = useTenant();
  const { can } = usePermissions();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [accountId, setAccountId] = useState("");
  const [result, setResult] = useState<CSVImportResult | null>(null);

  // Create account form state
  const [showCreate, setShowCreate] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [newCurrency, setNewCurrency] = useState("SAR");

  const importMutation = useMutation({
    mutationFn: () => importBankCSV(currentTenant!.id, file!, accountId),
    onSuccess: (data) => setResult(data),
  });

  const createAccountMutation = useMutation({
    mutationFn: (input: CreateBankAccountInput) =>
      createBankAccount(currentTenant!.id, input),
    onSuccess: (data) => {
      setAccountId(data.id);
      setShowCreate(false);
      setNewNickname("");
    },
  });

  const canImport = can("ingestion:import");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t.import.title}</h1>
      <p className="text-muted-foreground">{t.import.subtitle}</p>

      {!canImport ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            You do not have permission to import transactions.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.import.selectFile}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  {file ? file.name : t.import.dragDrop}
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setResult(null);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>{t.import.selectAccount}</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Bank Account ID"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowCreate(!showCreate)}
                    title={t.import.createAccount}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {showCreate && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{t.import.accountNickname}</Label>
                      <Input
                        value={newNickname}
                        onChange={(e) => setNewNickname(e.target.value)}
                        placeholder="e.g. Main Business Account"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t.import.accountCurrency}</Label>
                      <Select value={newCurrency} onValueChange={setNewCurrency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SAR">SAR</SelectItem>
                          <SelectItem value="AED">AED</SelectItem>
                          <SelectItem value="QAR">QAR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      size="sm"
                      disabled={!newNickname || createAccountMutation.isPending}
                      onClick={() =>
                        createAccountMutation.mutate({
                          nickname: newNickname,
                          currency: newCurrency,
                        })
                      }
                    >
                      {t.import.createAccount}
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Button
                className="w-full"
                disabled={!file || !accountId || importMutation.isPending}
                onClick={() => importMutation.mutate()}
              >
                {importMutation.isPending ? t.import.uploading : t.common.upload}
              </Button>

              {importMutation.isError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {(importMutation.error as Error).message}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Result */}
          {result && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-base">{t.import.success}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t.import.totalRows}</dt>
                    <dd className="font-medium">{result.data.total_rows}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t.import.inserted}</dt>
                    <dd className="font-medium text-green-600">{result.data.inserted}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t.import.duplicates}</dt>
                    <dd className="font-medium text-yellow-600">{result.data.duplicates}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t.import.errors}</dt>
                    <dd className="font-medium text-red-600">{result.data.errors}</dd>
                  </div>
                </dl>
                {result.data.error_detail?.length > 0 && (
                  <div className="mt-4 rounded bg-red-50 p-3 text-xs text-red-700 space-y-1">
                    {result.data.error_detail.map((e, i) => (
                      <p key={i}>{e}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
