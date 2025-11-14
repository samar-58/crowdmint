"use client";
import { useEffect, useRef, useState } from "react";
import { usePresignedUrl } from "@/hooks/usePresignedUrl";
import axios from "axios";
import api from "@/lib/api";

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
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
    
    setUploading(true);
    try {
      const data = await refetch({
        "x-file-type": selectedFile.type,
      });
      
      if (!data) {
        throw new Error("Failed to get presigned URL");
      }

      const formData = new FormData();
      
      if (data.fields.bucket) {
        formData.set("bucket", data.fields.bucket);
      }
      if (data.fields["X-Amz-Algorithm"]) {
        formData.set("X-Amz-Algorithm", data.fields["X-Amz-Algorithm"]);
      }
      if (data.fields["X-Amz-Credential"]) {
        formData.set("X-Amz-Credential", data.fields["X-Amz-Credential"]);
      }
      if (data.fields["X-Amz-Date"]) {
        formData.set("X-Amz-Date", data.fields["X-Amz-Date"]);
      }
      if (data.fields.key) {
        formData.set("key", data.fields.key);
      }
      if (data.fields.Policy) {
        formData.set("Policy", data.fields.Policy);
      }
      if (data.fields["X-Amz-Signature"]) {
        formData.set("X-Amz-Signature", data.fields["X-Amz-Signature"]);
      }
      formData.append("Content-Type", selectedFile.type);
      formData.append("file", selectedFile);
      await axios.post(data.url, formData);

      console.log("File uploaded successfully!",data.fields);
      setSelectedFile(null);
      if (fileRef.current) {
        fileRef.current.value = '';
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 p-4">
      <h1 className="text-2xl font-bold">Upload</h1>
      <input
        ref={fileRef}
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
        disabled={!selectedFile || isFetching || uploading}
        className="bg-blue-500 text-white p-2 rounded-md cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600"
      >
        {(isFetching || uploading) ? "Uploading..." : "Upload"}
      </button>
      {error && (
        <p className="text-red-500 text-sm">
          Error: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      )}
    </div>
  );
}