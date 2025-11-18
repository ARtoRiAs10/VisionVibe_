// 'use client';

// import { useState } from 'react';
// import { ImageUploader } from '@/components/image-uploader';
// import { DesignControls } from '@/components/design-controls';
// import { ResultViewer } from '@/components/result-viewer';
// import { Card } from '@/components/ui/card';
// import { VisionVibeControls, ImageFile } from '@/types';

// export default function DashboardPage() {
//   const [imageFile, setImageFile] = useState<ImageFile | null>(null);
//   const [generatedImage, setGeneratedImage] = useState<string | null>(null);
//   const [description, setDescription] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleImageSelect = (file: ImageFile) => {
//     setImageFile(file);
//     setError(null);
//   };

//   const handleDesignGenerate = async (controls: VisionVibeControls) => {
//     if (!imageFile) {
//       setError('Please select an image first');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       // Decorate image
//       const decorateResponse = await fetch('/api/decorate-image', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ imageFile, controls }),
//       });

//       if (!decorateResponse.ok) {
//         throw new Error('Failed to generate decorated image');
//       }

//       const { generatedImageUrl } = await decorateResponse.json();
//       setGeneratedImage(generatedImageUrl);

//       // Get description
//       const describeResponse = await fetch('/api/describe-image', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ imageFile: { ...imageFile, base64: generatedImageUrl.split(',') } }),
//       });

//       if (describeResponse.ok) {
//         const { description: desc } = await describeResponse.json();
//         setDescription(desc);
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
//           Create Your Design
//         </h1>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Column - Upload & Controls */}
//           <div className="lg:col-span-1 space-y-4">
//             <Card>
//               <ImageUploader onImageSelect={handleImageSelect} />
//             </Card>

//             <Card>
//               <DesignControls 
//                 onGenerate={handleDesignGenerate}
//                 disabled={!imageFile || loading}
//               />
//             </Card>
//           </div>

//           {/* Right Column - Result */}
//           <div className="lg:col-span-2">
//             <ResultViewer
//               generatedImage={generatedImage}
//               description={description}
//               loading={loading}
//               error={error}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';

import { useState } from 'react';
import { ImageUploader } from '@/components/image-uploader';
import { DesignControls } from '@/components/design-controls';
import { ResultViewer } from '@/components/result-viewer';
import { Card } from '@/components/ui/card';
import { VisionVibeControls, ImageFile } from '@/types';

export default function DashboardPage() {
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: ImageFile) => {
    setImageFile(file);
    setError(null);
  };

  const handleDesignGenerate = async (controls: VisionVibeControls) => {
    if (!imageFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setDescription(null);

    try {
      // 1️⃣ Decorate image
      const decorateResponse = await fetch('/api/decorate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageFile, controls }),
      });

      if (!decorateResponse.ok) {
        throw new Error('Failed to generate decorated image');
      }

      const { generatedImageUrl } = await decorateResponse.json();
      setGeneratedImage(generatedImageUrl);

      // 2️⃣ Describe the generated image
      const describeResponse = await fetch('/api/describe-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageFile: {
            base64: generatedImageUrl,        // <-- FIXED (send correct output)
            mimeType: imageFile.mimeType,
            name: imageFile.name,
          }
        }),
      });

      if (describeResponse.ok) {
        const { description: desc } = await describeResponse.json();
        setDescription(desc);
      } else {
        console.warn("Image description failed");
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          Create Your Design
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <ImageUploader onImageSelect={handleImageSelect} />
            </Card>

            <Card>
              <DesignControls
                onGenerate={handleDesignGenerate}
                disabled={!imageFile || loading}
              />
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            <ResultViewer
              generatedImage={generatedImage}
              description={description}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
