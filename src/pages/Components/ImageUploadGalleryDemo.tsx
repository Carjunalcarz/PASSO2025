import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useEffect } from 'react';
import ImageUploadGallery from '../../components/ImageUploadGallery';
import type { ImageListType } from 'react-images-uploading';
import CodeHighlight from '../../components/Highlight';
import IconCode from '../../components/Icon/IconCode';

const ImageUploadGalleryDemo = () => {
    const dispatch = useDispatch();
    const [codeArr, setCodeArr] = useState<string[]>([]);
    const [images, setImages] = useState<ImageListType>([]);

    useEffect(() => {
        dispatch(setPageTitle('Image Upload Gallery'));
    });

    const toggleCode = (name: string) => {
        if (codeArr.includes(name)) {
            setCodeArr((value) => value.filter((d) => d !== name));
        } else {
            setCodeArr([...codeArr, name]);
        }
    };

    const handleImageChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        setImages(imageList);
    };

    return (
        <div>
            <div className="panel mt-6">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Image Upload Gallery with Slide Navigation</h5>
                    <button onClick={() => toggleCode('code1')} className="font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600">
                        <span className="flex items-center">
                            <IconCode className="me-2" />
                            Code
                        </span>
                    </button>
                </div>

                <div className="mb-5">
                    <ImageUploadGallery
                        images={images}
                        onChange={handleImageChange}
                        maxNumber={10}
                        multiple={true}
                    />
                </div>

                {codeArr.includes('code1') && (
                    <CodeHighlight>
                        <pre className="language-typescript">{`import React, { useState } from 'react';
import ImageUploadGallery from '../../components/ImageUploadGallery';
import type { ImageListType } from 'react-images-uploading';

const ImageUploadGalleryDemo = () => {
    const [images, setImages] = useState<ImageListType>([]);

    const handleImageChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        setImages(imageList);
    };

    return (
        <ImageUploadGallery
            images={images}
            onChange={handleImageChange}
            maxNumber={10}
            multiple={true}
        />
    );
};`}</pre>
                    </CodeHighlight>
                )}
            </div>
        </div>
    );
};

export default ImageUploadGalleryDemo; 