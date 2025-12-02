'use client';

import { useState, useEffect, useRef} from 'react';

export default function Configuration() {
  const [files, setFiles] = useState<File[]>([]);
  const [collectionName, setCollectionName] = useState<string>('documents');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [googleLoggedIn, setGoogleLoggedIn] = useState(false);
  const initDoneRef = useRef(false);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''; // e.g. http://127.0.0.1:8000
  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('collection_name', collectionName);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Upload failed');
      }

      const result = await res.json();
      setUploadStatus({
        type: 'success',
        message: `Successfully uploaded ${files.length} file(s)`,
      });
      setFiles([]);
    } catch (err: any) {
      setUploadStatus({
        type: 'error',
        message: err?.message || 'Upload failed',
      });
    } finally {
      setUploading(false);
    }
  };

// Minimal Google Identity Services setup: load script and render button
    useEffect(() => {
  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

  if (!CLIENT_ID) return;
  if (initDoneRef.current) return;

  const init = () => {
    // @ts-ignore
    if (!window.google?.accounts?.id) return;

    // @ts-ignore
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (resp: any) => {
        const token = resp?.credential;
        if (!token) return;
        fetch(`${BACKEND.replace(/\/$/, '')}/login/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        }).then(() => setGoogleLoggedIn(true));
      },
    });

    // @ts-ignore
    window.google.accounts.id.renderButton(
      document.getElementById('googleButtonDiv'),
      { theme: 'outline', size: 'large' }
    );

    // Do not call prompt() automatically
    initDoneRef.current = true;
  };

  const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
  if (existing) {
    init();
    return;
  }
  const s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.async = true;
  s.defer = true;
  s.onload = init;
  document.head.appendChild(s);
}, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Document Upload</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Upload PDF, DOCX, or TXT files to add them to your knowledge base
        </p>

        {/* Collection Name Input */}
        <div className="mb-4">
          <label htmlFor="collection-name" className="text-sm font-medium mb-2 block">
            Collection Name
          </label>
          <input
            id="collection-name"
            type="text"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            placeholder="e.g., documents, research, notes"
            className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-ring"
            disabled={uploading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Specify which collection to store your documents in the vector database
          </p>
        </div>

        {/* File Input */}
        <div className="mb-4">
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center w-full h-32 px-4 transition bg-background border-2 border-dashed border-border rounded-xl appearance-none cursor-pointer hover:border-primary/50 focus:outline-none"
          >
            <div className="flex flex-col items-center space-y-2">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-sm text-muted-foreground">
                <span className="font-medium text-primary">Click to upload</span> or drag and
                drop
              </span>
              <span className="text-xs text-muted-foreground">
                PDF, DOCX, TXT (max 10MB each)
              </span>
            </div>
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mb-4 space-y-2">
            <h3 className="text-sm font-medium mb-2">Selected Files ({files.length})</h3>
            <div className="space-y-2 max-h-64 overflow-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    className="ml-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                    aria-label="Remove file"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="w-full rounded-xl bg-primary text-primary-foreground px-4 py-3 shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
        </button>

        {/* Status Message */}
        {uploadStatus && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              uploadStatus.type === 'success'
                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
            }`}
          >
            {uploadStatus.message}
          </div>
        )}

        {/* Google Login Button */}
        <div className="mt-6">
          <div id="googleButtonDiv" style={{ minHeight: 48 }} />
          {googleLoggedIn && (
            <p className="mt-3 text-sm text-primary">Signed in with Google</p>
          )}
        </div>

      </div>

      {/* Additional Configuration Options (placeholder) */}
      
    </div>
  );
}
