import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import IconX from './Icon/IconX';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function cleanUrl(url: string) {
  if (url.startsWith('data:image') && url.includes('http')) {
    return url.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
  }
  return url;
}

interface ImageUploadGalleryProps {
    images: ImageListType;
    onChange: (imageList: ImageListType, addUpdateIndex: number[] | undefined) => void;
    maxNumber?: number;
    multiple?: boolean;
    className?: string;
    maxImageHeight?: string;
    maxImageWidth?: string;
    imageFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    containerWidth?: string;
}

const ImageUploadGallery: React.FC<ImageUploadGalleryProps> = ({
    images,
    onChange,
    maxNumber = 10,
    multiple = true,
    className = '',
    maxImageHeight,
    maxImageWidth,
    imageFit,
    containerWidth
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const swiperRef = useRef<SwiperType | null>(null);
    const [swiperKey, setSwiperKey] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    // Force swiper reinitialization when images change
    useEffect(() => {
        setSwiperKey(prev => prev + 1);
        setActiveIndex(0);
        setIsZoomed(false);
        setZoomLevel(1);
    }, [images]);

    // Keyboard support for zoom
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isZoomed) return;
            
            switch (event.key) {
                case 'Escape':
                    handleResetZoom();
                    break;
                case '+':
                case '=':
                    event.preventDefault();
                    handleZoomIn();
                    break;
                case '-':
                    event.preventDefault();
                    handleZoomOut();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isZoomed, zoomLevel]);

    const handleImageClick = () => {
        if (isZoomed) {
            setIsZoomed(false);
            setZoomLevel(1);
        } else {
            setIsZoomed(true);
            setZoomLevel(2);
        }
    };

    const handleContainerClick = (e: React.MouseEvent) => {
        handleImageClick();
    };

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.5, 4));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
    };

    const handleResetZoom = () => {
        setIsZoomed(false);
        setZoomLevel(1);
    };

    return (
        <div className={`image-upload-gallery ${className}`} style={{ maxWidth: containerWidth || '100%' }}>
            <ImageUploading
                value={images}
                onChange={onChange}
                maxNumber={maxNumber}
                multiple={multiple}
                dataURLKey="data_url"
            >
                {({
                    imageList,
                    onImageUpload,
                    onImageRemoveAll,
                    onImageRemove,
                    isDragging,
                    dragProps
                }) => (
                    <div className="space-y-4">
                        {/* Upload Area */}
                        <div
                            {...dragProps}
                            className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors w-full ${
                                isDragging
                                    ? 'border-primary bg-primary/10'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                            }`}
                        >
                            <div className="space-y-2 w-full">
                                <div className="mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center w-8 h-8">
                                    <svg
                                        className="w-4 h-4 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={onImageUpload}
                                        className="btn btn-primary btn-xs"
                                    >
                                        Choose Files
                                    </button>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        or drag and drop
                                    </p>
                                </div>
                                {imageList.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={onImageRemoveAll}
                                        className="btn btn-outline-danger btn-xs"
                                    >
                                        Remove All
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Gallery Preview */}
                        {imageList.length > 0 && (
                            <div className="space-y-4">
                                {/* Main Swiper */}
                                <div className="relative flex items-center justify-center" style={{ minHeight: maxImageHeight || '400px' }}>
                                    <Swiper
                                        key={swiperKey}
                                        spaceBetween={10}
                                        navigation={false}
                                        pagination={{ clickable: true }}
                                        modules={[Navigation, Pagination]}
                                        className="main-swiper"
                                        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                                        onSwiper={(swiper) => {
                                            swiperRef.current = swiper;
                                        }}
                                        loop={false}
                                        allowTouchMove={true}
                                        slidesPerView={1}
                                        initialSlide={0}
                                        style={{ minHeight: maxImageHeight || '400px' }}
                                    >
                                        {imageList.map((image, index) => (
                                            <SwiperSlide key={`slide-${swiperKey}-${index}`}>
                                                <div className="relative group">
                                                    <div 
                                                        className={`relative overflow-hidden rounded-lg ${isZoomed ? 'cursor-grab' : 'cursor-zoom-in'}`}
                                                        onClick={handleContainerClick}
                                                    >
                                                        <img
                                                            src={cleanUrl(image.data_url)}
                                                            alt={`Image ${index + 1}`}
                                                            className="w-full rounded-lg transition-transform duration-300"
                                                            style={{
                                                                maxHeight: isZoomed ? 'none' : (maxImageHeight || '600px'),
                                                                maxWidth: isZoomed ? 'none' : (maxImageWidth || '100%'),
                                                                objectFit: imageFit || 'contain',
                                                                transform: `scale(${zoomLevel})`,
                                                                transformOrigin: 'center center',
                                                                userSelect: 'none',
                                                                pointerEvents: isZoomed ? 'none' : 'auto'
                                                            }}
                                                        />
                                                    </div>
                                                    
                                                    {/* Zoom Controls */}
                                                    {isZoomed && (
                                                        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white rounded-lg p-2 flex gap-2">
                                                            <button
                                                                type="button"
                                                                className="px-2 py-1 bg-blue-500 rounded hover:bg-blue-600 text-xs"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleZoomOut();
                                                                }}
                                                            >
                                                                -
                                                            </button>
                                                            <span className="px-2 py-1 text-xs">
                                                                {Math.round(zoomLevel * 100)}%
                                                            </span>
                                                            <button
                                                                type="button"
                                                                className="px-2 py-1 bg-blue-500 rounded hover:bg-blue-600 text-xs"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleZoomIn();
                                                                }}
                                                            >
                                                                +
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="px-2 py-1 bg-gray-500 rounded hover:bg-gray-600 text-xs"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleResetZoom();
                                                                }}
                                                            >
                                                                Reset
                                                            </button>
                                                        </div>
                                                    )}
                                                    
                                                    <button
                                                        type="button"
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                        onClick={() => onImageRemove(index)}
                                                        title="Remove image"
                                                    >
                                                        <IconX className="w-4 h-4" />
                                                    </button>
                                                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                                        {index + 1} of {imageList.length}
                                                    </div>
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>

                                    {/* Custom Navigation Buttons */}
                                    {imageList.length > 1 && (
                                        <>
                                            <button 
                                                className="absolute top-1/2 left-2 z-10 grid -translate-y-1/2 place-content-center rounded-full border border-primary bg-white p-2 text-primary transition hover:border-primary hover:bg-primary hover:text-white"
                                                onClick={() => {
                                                    if (swiperRef.current && activeIndex > 0) {
                                                        swiperRef.current.slideTo(activeIndex - 1);
                                                    }
                                                }}
                                                disabled={activeIndex === 0}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <button 
                                                className="absolute top-1/2 right-2 z-10 grid -translate-y-1/2 place-content-center rounded-full border border-primary bg-white p-2 text-primary transition hover:border-primary hover:bg-primary hover:text-white"
                                                onClick={() => {
                                                    if (swiperRef.current && activeIndex < imageList.length - 1) {
                                                        swiperRef.current.slideTo(activeIndex + 1);
                                                    }
                                                }}
                                                disabled={activeIndex === imageList.length - 1}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Thumbnails */}
                                {imageList.length > 1 && (
                                    <div className="grid grid-cols-6 gap-2">
                                        {imageList.map((image, index) => (
                                            <div key={`thumb-${swiperKey}-${index}`} className="relative group">
                                                <img
                                                    src={cleanUrl(image.data_url)}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    className={`w-full h-16 object-cover rounded cursor-pointer transition-all duration-200 ${
                                                        index === activeIndex
                                                            ? 'ring-2 ring-primary opacity-100'
                                                            : 'opacity-70 hover:opacity-100'
                                                    }`}
                                                    onClick={() => {
                                                        if (swiperRef.current) {
                                                            swiperRef.current.slideTo(index);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Image Counter */}
                                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                                    {imageList.length} image{imageList.length !== 1 ? 's' : ''} uploaded
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ImageUploading>
        </div>
    );
};

export default ImageUploadGallery; 