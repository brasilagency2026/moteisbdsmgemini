"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, UploadCloud, X } from "lucide-react";
import Image from "next/image";

export function ImageUpload({ 
  onUpload, 
  maxFiles = 3,
  existingPhotos = []
}: { 
  onUpload: (id: string, url: string) => void, 
  maxFiles?: number,
  existingPhotos?: {id: string, url: string}[]
}) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (existingPhotos.length + files.length > maxFiles) {
      alert(`Você só pode enviar até ${maxFiles} fotos no seu plano atual.`);
      return;
    }

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        // We'll just pass the storageId back, the parent can fetch the URL or we can just show a placeholder
        // For immediate preview, we can use URL.createObjectURL
        onUpload(storageId, URL.createObjectURL(file));
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {existingPhotos.map((photo, i) => (
          <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-zinc-700">
            <Image src={photo.url} alt="Preview" fill className="object-cover" referrerPolicy="no-referrer" />
          </div>
        ))}
        
        {existingPhotos.length < maxFiles && (
          <label className="w-24 h-24 rounded-lg border-2 border-dashed border-zinc-700 hover:border-red-500 flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-900/50">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            ) : (
              <>
                <UploadCloud className="w-6 h-6 text-zinc-400 mb-1" />
                <span className="text-[10px] text-zinc-500 font-medium">Upload</span>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleUpload} 
              disabled={isUploading} 
              className="hidden"
            />
          </label>
        )}
      </div>
      <p className="text-xs text-zinc-500">
        {existingPhotos.length} de {maxFiles} fotos enviadas.
      </p>
    </div>
  );
}
