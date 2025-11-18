'use client';

import Image from 'next/image';
import { Button } from './ui/button';
import { LoadingSpinner, DownloadIcon, ShareIcon } from './icons';

interface ResultViewerProps {
  generatedImage: string | null;
  description: string | null;
  loading: boolean;
  error: string | null;
}

export function ResultViewer({
  generatedImage,
  description,
  loading,
  error,
}: ResultViewerProps) {
  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'vision-vibe-design.png';
    link.click();
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 min-h-[600px] flex flex-col items-center justify-center">
      {error && (
        <div className="text-center space-y-4">
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold">
            ❌ {error}
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-gray-600 dark:text-gray-400">
            Generating your design...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            This may take a moment
          </p>
        </div>
      )}

      {generatedImage && !loading && (
        <div className="w-full space-y-4">
          <div className="relative w-full h-96 rounded-lg overflow-hidden">
            <img
              src={generatedImage}
              alt="Generated Design"
              className="w-full h-full object-cover"
            />
          </div>

          {description && (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Design Description
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {description}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
            >
              <DownloadIcon className="w-4 h-4" />
              Download
            </Button>
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <ShareIcon className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      )}

      {!generatedImage && !loading && !error && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>Your generated design will appear here</p>
        </div>
      )}
    </div>
  );
}
