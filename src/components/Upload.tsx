"use client";
import { useState } from "react";
import { usePresignedUrl } from "@/hooks/usePresignedUrl";

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { data: presignedData, refetch, isFetching, error } = usePresignedUrl();

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }
    try {
      const { data } = await refetch(); 
      if (!data) {
        throw new Error("Failed to get presigned URL");
      }

      const formData = new FormData();
      
      Object.entries(data.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      
      formData.append('file', selectedFile);

      const uploadResponse = await fetch(data.url, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to S3");
      }

      console.log("File uploaded successfully!");
      setSelectedFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 p-4">
      <h1 className="text-2xl font-bold">Upload</h1>
      <input
        id="file-input"
        type="file"
        className="w-full max-w-md p-2 border border-gray-300 rounded-md cursor-pointer"
        onChange={onFileSelect}
        accept="image/*"
      />
      {selectedFile && (
        <p className="text-sm text-gray-600">
          Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
        </p>
      )}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || isFetching}
        className="bg-blue-500 text-white p-2 rounded-md cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600"
      >
        {isFetching ? "Uploading..." : "Upload"}
      </button>
      {error && (
        <p className="text-red-500 text-sm">
          Error: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      )}
    </div>
  );
}