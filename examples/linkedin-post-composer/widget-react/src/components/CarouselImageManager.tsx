import { X } from "lucide-react";

export interface CarouselImage {
  url: string;
  order: number;
}

export interface CarouselImageManagerProps {
  images: CarouselImage[];
  onRemoveImage: (order: number) => void;
  onReorder?: (images: CarouselImage[]) => void;
  maxImages?: number;
}

export function CarouselImageManager({
  images,
  onRemoveImage,
  maxImages = 20
}: CarouselImageManagerProps) {
  if (images.length === 0) return null;

  // Sort by order
  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Carousel Images ({images.length} of {maxImages})
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {images.length < 2 && 'Minimum 2 images required'}
          {images.length >= 2 && images.length < maxImages && 'Click "Add Media" to add more'}
          {images.length === maxImages && 'Maximum images reached'}
        </p>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-4 gap-3">
        {sortedImages.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 group"
          >
            {/* Image */}
            <img
              src={image.url}
              alt={`Carousel image ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Order Badge */}
            <div className="absolute top-2 left-2 w-6 h-6 bg-black/70 text-white text-xs font-semibold rounded-full flex items-center justify-center">
              {index + 1}
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemoveImage(image.order)}
              className="absolute top-2 right-2 w-6 h-6 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              aria-label={`Remove image ${index + 1}`}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Images will be displayed in this order on LinkedIn. Hover over an image to remove it.
      </p>
    </div>
  );
}
