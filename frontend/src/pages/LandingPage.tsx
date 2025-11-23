import { Paperclip } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import curveSvg from '../assets/curve.svg';
import boxSvg from '../assets/box.svg';
import wavySvg from '../assets/wavy.svg';

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const [isExpanding, setIsExpanding] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const navigate = useNavigate();

  // Theme options
  const themeOptions = [
    { word: 'Create', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }, // Purple
    { word: 'Relive', color: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' }, // Blue
    { word: 'Change', color: 'linear-gradient(135deg, #fc54a5ff 0%, #ff6a00 100%)' }  // Orange/Pink
  ];

  // State for cycling through themes
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);
  const actionWord = themeOptions[currentThemeIndex].word;
  const backgroundColor = themeOptions[currentThemeIndex].color;

  // Auto-cycle through themes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBouncing(true);
      setTimeout(() => {
        setCurrentThemeIndex((prev) => (prev + 1) % themeOptions.length);
        setTimeout(() => setIsBouncing(false), 600);
      }, 0);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Generate random stars
  const stars = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: `${2 + Math.random() * 3}s`,
      delay: `${Math.random() * 3}s`,
      size: Math.random() > 0.5 ? 2 : 1
    }));
  }, []);

  const handleClick = () => {
    // // Only proceed if there's a prompt or files
    // if (!prompt.trim() && selectedFiles.length === 0) {
    //   return;
    // }

    setIsExpanding(true);
    // Wait for animation to complete before navigating
    setTimeout(() => {
      navigate('/generate', { state: { backgroundColor, images: imagePreviews, prompt } });
    }, 800);
  };

  const isButtonDisabled = !prompt.trim() && selectedFiles.length === 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);

      // Create preview URLs for images
      const newPreviews: string[] = [];
      files.forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push(reader.result as string);
            if (newPreviews.length === files.filter(f => f.type.startsWith('image/')).length) {
              setImagePreviews(prev => [...prev, ...newPreviews]);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => {
      const imageFiles = prev.filter(f => f.type.startsWith('image/'));
      const nonImageFiles = prev.filter(f => !f.type.startsWith('image/'));
      imageFiles.splice(index, 1);
      return [...imageFiles, ...nonImageFiles];
    });
  };

  return (
    <>
      <style>{`
        .landing-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }
        
        .background-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transition: opacity 3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .stars {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }
        
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          animation: twinkle var(--duration) ease-in-out infinite;
          opacity: 0;
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }
        
        .landing-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          width: 100%;
          position: relative;
          z-index: 1;
        }
        
        .landing-title {
          font-size: 2.5rem;
          font-weight: bold;
          margin: 0;
          text-align: center;
          padding: 0 1rem;
          letter-spacing: -0.05em;
          position: relative;
          font-family: 'Manrope', sans-serif;
          transition: opacity 0.5s ease-in-out;
        }
        
        .landing-title.bouncing {
          animation: bounceText 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        @keyframes bounceText {
          0% {
            transform: scale(1) translateY(0);
          }
          30% {
            transform: scale(1.15) translateY(-10px);
          }
          50% {
            transform: scale(0.95) translateY(5px);
          }
          70% {
            transform: scale(1.05) translateY(-3px);
          }
          100% {
            transform: scale(1) translateY(0);
          }
        }
        
        .title-curve {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: auto;
          transition: opacity 0.5s ease-in-out;
        }
        
        .prompt-box {
          background-color: rgba(71, 71, 71, 0.4);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 1rem 1rem 1rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 800px;
          max-width: 90vw;
        }
        
        .prompt-textarea {
          padding: 0.5rem 0;
          border-radius: 8px;
          border: none;
          font-size: 1rem;
          width: 100%;
          min-height: 80px;
          outline: none;
          box-sizing: border-box;
          resize: none;
          background-color: transparent;
          font-family: inherit;
          color: #ffffff;
        }
        
        .prompt-textarea::placeholder {
          color: #d1d5db;
        }
        
        .prompt-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 2px solid #d1d5db;
          padding-top: 1rem;
          gap: 1rem;
        }
        
        .submit-button {
          padding: 0.875rem 2rem;
          border-radius: 8px;
          background: #86F5FF;
          color: black;
          border: none;
          outline: none;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          white-space: nowrap;
          transition: background 0.2s ease;
        }
        
        .submit-button:hover {
          background: #5FE3F0;
        }
        
        .submit-button:disabled {
          background: #86F5FF;
          color: #6b7280;
          cursor: not-allowed;
          opacity: 0.3;
        }
        
        .submit-button:disabled:hover {
          background: #86F5FF;
        }
        
        .landing-container.expanding {
          animation: expandOut 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes expandOut {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(20);
            opacity: 0;
          }
        }
        
        .camera-icon {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: background 0.2s ease;
        }
        
        .camera-icon:hover {
          background: rgba(0, 0, 0, 0.05);
        }
        
        .file-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .file-badge {
          background: #e5e7eb;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .image-previews {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        
        .image-preview-container {
          position: relative;
          width: 100px;
          height: 100px;
        }
        
        .image-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #6b7280;
        }
        
        .image-delete-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 24px;
          height: 24px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          border-radius: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          line-height: 1;
          transition: background 0.2s ease;
        }
        
        .image-delete-btn:hover {
          background: rgba(0, 0, 0, 0.8);
        }
        
        @media (max-width: 768px) {
          .landing-title {
            font-size: 2rem;
          }
          
          .prompt-box {
            padding: 1.5rem;
            width: 100%;
          }
          
          .prompt-footer {
            flex-direction: column;
            align-items: stretch;
          }
          
          .submit-button {
            width: 100%;
            text-align: center;
          }
        }
        
        @media (max-width: 480px) {
          .landing-title {
            font-size: 1.5rem;
          }
          
          .prompt-box {
            padding: 1rem;
          }
          
          .prompt-textarea {
            min-height: 50px;
            font-size: 0.9rem;
          }
          
          .submit-button {
            padding: 0.75rem 1.5rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
      <div
        className={`landing-container ${isExpanding ? 'expanding' : ''}`}
      >
        {/* Background layers for smooth crossfade */}
        {themeOptions.map((theme, index) => (
          <div
            key={theme.word}
            className="background-layer"
            style={{
              background: theme.color,
              opacity: currentThemeIndex === index ? 1 : 0,
              zIndex: 0
            }}
          />
        ))}
        <div className="stars">
          {stars.map((star) => (
            <div
              key={star.id}
              className="star"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                '--duration': star.duration,
                animationDelay: star.delay
              } as React.CSSProperties & { '--duration': string }}
            />
          ))}
        </div>
        <div className="landing-content">
          <h1 className={`landing-title ${isBouncing ? 'bouncing' : ''}`}>
            {actionWord}
            <img
              src={actionWord === 'Change' ? boxSvg : actionWord === 'Relive' ? wavySvg : curveSvg}
              alt=""
              className="title-curve"
            />
          </h1>
          <h2>your world today</h2>
          <button
            className="submit-button"
            onClick={handleClick}
          // disabled={isButtonDisabled}
          >
            Create your world
          </button>
          {/* <div className="prompt-box">
            <textarea
              className="prompt-textarea"
              placeholder="Write your prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            {imagePreviews.length > 0 && (
              <div className="image-previews">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview-container">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="image-preview"
                    />
                    <button
                      className="image-delete-btn"
                      onClick={() => removeImage(index)}
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {selectedFiles.length > 0 && selectedFiles.some(f => !f.type.startsWith('image/')) && (
              <div className="file-list">
                {selectedFiles.filter(f => !f.type.startsWith('image/')).map((file, index) => (
                  <div key={index} className="file-badge">
                    📎 {file.name}
                  </div>
                ))}
              </div>
            )}
            <div className="prompt-footer">
              <div
                className="camera-icon"
                onClick={() => document.getElementById("imageUpload")?.click()}
              >
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <Paperclip size={24} color="#ffffffff" />
                <span style={{ fontSize: "0.95rem", color: "#f4f4f4ff" }}>
                  Upload file
                </span>
              </div>
              <button
                className="submit-button"
                onClick={handleClick}
                disabled={isButtonDisabled}
              >
                Create your world
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
}
