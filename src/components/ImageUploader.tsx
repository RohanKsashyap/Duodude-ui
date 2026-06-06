import React, { useRef, useState } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import api from '../config/axios';

interface ImageUploaderProps {
  /** Current image URL value */
  value: string;
  /** Called with the new ImageKit URL once upload completes */
  onChange: (url: string) => void;
  /** Optional folder inside your ImageKit account, e.g. "/products" or "/slides" */
  folder?: string;
  /** Extra className forwarded to the wrapper div */
  className?: string;
  /** Input placeholder shown alongside the URL text box */
  placeholder?: string;
  /** Dark-mode variant for admin panels that have a dark background */
  dark?: boolean;
}

/**
 * Renders an image URL text-input + "Upload" button.
 * Clicking upload opens a file picker, sends the file to the backend
 * /api/upload endpoint, and fills the URL field with the returned ImageKit CDN URL.
 */
const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  folder = '/duodude',
  className = '',
  placeholder = 'Image URL',
  dark = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      const res = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onChange(res.data.url);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Upload failed. Please try again.';
      setError(msg);
    } finally {
      setUploading(false);
      // Reset so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const inputClass = dark
    ? 'flex-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
    : 'flex-1 border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black';

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-2">
        {/* URL text input — admin can still paste a URL manually */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Upload image to ImageKit CDN"
          className={`
            flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${dark
              ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800'
              : 'bg-black hover:bg-gray-800 text-white disabled:bg-gray-400'
            }
          `}
        >
          {uploading ? (
            <Loader size={14} className="animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>

      {/* Preview thumbnail */}
      {value && (
        <div className="relative w-20 h-20 rounded overflow-hidden border border-gray-300">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5"
            title="Remove image"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}
    </div>
  );
};

export default ImageUploader;
