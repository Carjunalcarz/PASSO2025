import React, { useState } from 'react';

const ID_PHOTO_SIZE = 600; // pixels

const IDPhotoPreview: React.FC = () => {
  const [front, setFront] = useState<string | null>(null);
  const [back, setBack] = useState<string | null>(null);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 32 }}>
      {/* Front ID */}
      <div>
        <div
          style={{
            width: ID_PHOTO_SIZE,
            height: ID_PHOTO_SIZE,
            border: '1px solid #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
            background: '#f9f9f9',
          }}
        >
          {front ? (
            <img
              src={front}
              alt="Front of ID"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span>Front Preview</span>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(e, setFront)}
        />
      </div>
      {/* Back ID */}
      <div>
        <div
          style={{
            width: ID_PHOTO_SIZE,
            height: ID_PHOTO_SIZE,
            border: '1px solid #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
            background: '#f9f9f9',
          }}
        >
          {back ? (
            <img
              src={back}
              alt="Back of ID"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span>Back Preview</span>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(e, setBack)}
        />
      </div>
    </div>
  );
};

export default IDPhotoPreview;