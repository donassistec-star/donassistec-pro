import { useState, useRef } from "react";
import { Button } from "./button";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadService } from "@/services/uploadService";
import { toast } from "sonner";

// Hosts que usam o mesmo host para /uploads (nginx proxy)
const PRODUCTION_DOMAIN = /^((www\.)?donassistec\.com\.br|177\.67\.32\.204)$/;

// Função para detectar URL da API (mesma lógica do api.ts)
const getApiBaseUrl = () => {
  // Se VITE_API_URL estiver definido, usar ele
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
  }

  // Se estiver rodando localmente, usar localhost
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:3001";
  }

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  // donassistec.com.br ou 177.67.32.204: mesmo host sem porta (uploads em /uploads)
  if (PRODUCTION_DOMAIN.test(hostname)) {
    return `${protocol}//${hostname}`;
  }

  // Outros hostnames: mesmo host e porta 3001
  return `${protocol}//${hostname}:3001`;
};

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  label?: string;
}

export const ImageUpload = ({ value, onChange, disabled, label = "Upload de Imagem" }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const fileName = file.name.toLowerCase();
    const isIco = fileName.endsWith(".ico");
    if (!file.type.startsWith("image/") && !isIco) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    try {
      setUploading(true);
      const result = await uploadService.uploadImage(file);
      if (result) {
        // Construir URL completa usando a detecção automática
        const fullUrl = result.url.startsWith("http") 
          ? result.url 
          : `${getApiBaseUrl()}${result.url}`;
        onChange(fullUrl);
        toast.success("Imagem enviada com sucesso!");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer upload da imagem");
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={handleRemove}
              disabled={disabled || uploading}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.ico"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
            id="image-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {preview ? "Alterar Imagem" : "Selecionar Imagem"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
