import IconX from '../../../components/Icon/IconX';

interface ImagePreviewModalProps {
    previewImage: string | null;
    setPreviewImage: (image: string | null) => void;
}

const ImagePreviewModal = ({ previewImage, setPreviewImage }: ImagePreviewModalProps) => {
    if (!previewImage) return null;

    const modalStyles = {
        modal: "fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center p-4",
        modalContent: "relative bg-white rounded-lg max-w-[90%] max-h-[90vh] overflow-auto",
        closeButton: "absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 cursor-pointer",
        image: "max-w-full h-auto max-h-[85vh] object-contain"
    };

    return (
        <div className={modalStyles.modal} onClick={() => setPreviewImage(null)}>
            <div className={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    className={modalStyles.closeButton}
                    onClick={() => setPreviewImage(null)}
                >
                    <IconX className="w-5 h-5" />
                </button>
                <img
                    src={previewImage}
                    alt="Large preview"
                    className={modalStyles.image}
                />
            </div>
        </div>
    );
};

export default ImagePreviewModal;
