import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { Header } from './components/Header';
import { Spinner } from './components/Spinner';
import { generateTryOnImage } from './services/geminiService';
import { UploadedImage } from './types';
import { ArrowRightIcon, SparklesIcon } from './components/Icons';

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<UploadedImage | null>(null);
  const [clothingImage, setClothingImage] = useState<UploadedImage | null>(null);
  const [garmentDescription, setGarmentDescription] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!personImage || !clothingImage) {
      setError('Please upload both a person and a clothing item.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const results = await generateTryOnImage(personImage, clothingImage, garmentDescription);
      setGeneratedImages(results.map(base64 => `data:image/png;base64,${base64}`));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [personImage, clothingImage, garmentDescription]);

  const canGenerate = personImage && clothingImage && !isLoading;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        <p className="text-center text-gray-400 mb-8 max-w-2xl">
          Upload a clear, front-facing photo of a person and a separate image of a clothing item. Our AI will generate an image of the person wearing the clothes.
        </p>

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-6">
          <ImageUploader title="Upload Person" onImageUpload={setPersonImage} />
          <div className="flex justify-center text-gray-500">
            <ArrowRightIcon className="w-12 h-12 transform rotate-90 md:rotate-0" />
          </div>
          <ImageUploader title="Upload Clothing" onImageUpload={setClothingImage} />
        </div>
        
        <div className="w-full max-w-lg mb-8">
            <label htmlFor="garment-description" className="block text-sm font-medium text-gray-400 mb-2 text-center">
                Optional: Specify garment (e.g., "the blue t-shirt")
            </label>
            <input
                type="text"
                id="garment-description"
                value={garmentDescription}
                onChange={(e) => setGarmentDescription(e.target.value)}
                placeholder="Describe the clothing item to use..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                aria-label="Garment description"
            />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-3
            ${canGenerate
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
        >
          <SparklesIcon className="w-6 h-6" />
          Generate Try-On
        </button>

        <div className="w-full max-w-4xl mt-8">
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-800/50 rounded-lg">
              <Spinner />
              <p className="mt-4 text-lg text-gray-300">AI is working its magic... Please wait.</p>
              <p className="text-sm text-gray-400">This can take up to 30 seconds.</p>
            </div>
          )}
          {error && (
            <div className="text-center p-4 bg-red-900/50 text-red-300 rounded-lg">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}
          {generatedImages.length > 0 && (
            <div className="bg-gray-800 p-4 rounded-lg shadow-2xl animate-fade-in">
              <h3 className="text-2xl font-bold mb-4 text-center text-indigo-400">Your Virtual Try-On Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedImages.map((imageSrc, index) => (
                    <img key={index} src={imageSrc} alt={`Generated try-on ${index + 1}`} className="w-full h-auto object-contain rounded-md" />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
