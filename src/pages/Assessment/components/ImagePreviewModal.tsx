import React, { useEffect } from 'react';
import IconX from '../../../components/Icon/IconX';

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  title?: string;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ isOpen, imageUrl, onClose, title }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative bg-white rounded-lg max-w-[90%] max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 cursor-pointer"
          onClick={onClose}
        >
          <IconX className="w-5 h-5" />
        </button>
        {title && <div className="text-lg font-semibold mb-2 text-center">{title}</div>}
        <img src={imageUrl} alt="Large preview" className="max-w-full h-auto max-h-[85vh] object-contain" />
      </div>
    </div>
  );
};

export default ImagePreviewModal;
