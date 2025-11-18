'use client';

import { Design } from '@/lib/db/schema';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Button } from './ui/button';

interface DesignGalleryProps {
  designs: Design[];
}

export function DesignGallery({ designs }: DesignGalleryProps) {
  if (designs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          No designs created yet
        </p>
        <Link href="/dashboard">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            Create Your First Design
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {designs.map((design) => (
        <Link key={design.id} href={`/designs/${design.id}`}>
          <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer">
            <div className="relative w-full h-48 bg-gray-100 dark:bg-slate-700">
              {design.generatedImageUrl && (
                <img
                  src={design.generatedImageUrl}
                  alt={design.theme}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {design.theme} - {design.subTheme}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Budget: {design.budget}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Created {formatDate(new Date(design.createdAt))}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
