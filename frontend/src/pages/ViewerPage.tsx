import { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Loader2, Upload, Info } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function ViewerPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [hiddenImageIndices, setHiddenImageIndices] = useState<Set<number>>(new Set());
  const location = useLocation();
  
  // Get images, prompt, and backgroundColor from navigation state (if passed from landing page)
  const initialImages = location.state?.images || [];
  const initialPromptFromNav = location.state?.prompt || '';
  const backgroundColor = location.state?.backgroundColor || 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)';
  
  // Editable prompt state
  const [currentPrompt, setCurrentPrompt] = useState(initialPromptFromNav);
  
  // Combine initial images with uploaded images, then filter out hidden ones
  const allImagesRaw = [...initialImages, ...uploadedImages];
  const allImages = allImagesRaw.filter((_, index) => !hiddenImageIndices.has(index));

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const removeImage = (indexInFiltered: number) => {
    // Find the actual index in allImagesRaw based on the filtered index
    let count = 0;
    let actualIndex = -1;
    for (let i = 0; i < allImagesRaw.length; i++) {
      if (!hiddenImageIndices.has(i)) {
        if (count === indexInFiltered) {
          actualIndex = i;
          break;
        }
        count++;
      }
    }
    
    if (actualIndex !== -1) {
      setHiddenImageIndices(prev => new Set([...prev, actualIndex]));
    }
  };

  const handleSave = () => {
    // Trigger model update with prompt and images
    console.log('Rendering model with prompt:', currentPrompt);
    console.log('All images:', allImages);
    
    // Reset loading to simulate model update
    setIsLoading(true);
    setLoadingProgress(0);
    
    // TODO: Add actual model update logic here with currentPrompt and allImages
    if (uploadedImages.length > 0) {
      alert(`Rendering model with updated prompt and ${uploadedImages.length} new image${uploadedImages.length > 1 ? 's' : ''}!`);
    } else {
      alert('Rendering model with updated prompt!');
    }
  };

  const handleReset = () => {
    // Clear all uploaded images and reset
    if (confirm('This will remove all uploaded images. Continue?')) {
      setUploadedImages([]);
      console.log('Reset: Cleared all uploaded images');
    }
  };

  // Simulate loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        .viewer-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .viewer-content {
          flex: 1;
          display: flex;
          padding: 2rem;
          gap: 2rem;
        }
        
        .canvas-container {
          flex: 1;
          background-color: #2a2a2a;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          min-height: 600px;
          transition: all 0.3s ease;
        }
        
        .canvas-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1000;
          border-radius: 0;
        }
        
        .fullscreen-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background-color: rgba(0, 0, 0, 0.5);
          border: 1px solid #86F5FF;
          color: #86F5FF;
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 10;
        }
        
        .fullscreen-button:hover {
          background-color: rgba(134, 245, 255, 0.2);
          border: 2px solid #86F5FF;
          transform: none;
        }
        
        .info-button {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background-color: rgba(0, 0, 0, 0.5);
          border: 1px solid #86F5FF;
          color: #86F5FF;
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 10;
        }
        
        .info-button:hover {
          background-color: rgba(134, 245, 255, 0.2);
          border: 2px solid #86F5FF;
          transform: none;
        }
        
        .info-popup-container {
          position: absolute;
          top: 3.5rem;
          left: 1rem;
          z-index: 11;
        }
        
        .info-popup {
          background-color: #2a2a2a;
          border: 1px solid #86F5FF;
          border-radius: 12px;
          padding: 1.5rem;
          width: auto;
          max-width: 800px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }
        
        .info-popup-title {
          color: #86F5FF;
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          text-align: center;
        }
        
        .info-steps {
          display: flex;
          flex-direction: row;
          gap: 1.5rem;
          align-items: stretch;
        }
        
        .info-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1rem;
          flex: 1;
        }
        
        .info-step:not(:last-child) {
          border-right: 1px solid #3a3a3a;
        }
        
        .info-step-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        .info-step-title {
          color: #e5e5e5;
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0.5rem 0 0.25rem 0;
        }
        
        .info-step-description {
          color: #9ca3af;
          font-size: 0.75rem;
          margin: 0;
        }
        
        .checkered-placeholder {
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(45deg, #3a3a3a 25%, transparent 25%),
            linear-gradient(-45deg, #3a3a3a 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #3a3a3a 75%),
            linear-gradient(-45deg, transparent 75%, #3a3a3a 75%);
          background-size: 40px 40px;
          background-position: 0 0, 0 20px, 20px -20px, -20px 0px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .placeholder-text {
          background-color: rgba(0, 0, 0, 0.7);
          color: #86F5FF;
          padding: 1.5rem 2rem;
          border-radius: 8px;
          font-size: 1.25rem;
          font-weight: 500;
        }
        
        .sidebar {
          width: 300px;
          background-color: #2a2a2a;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .sidebar-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .sidebar-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #86F5FF;
          margin: 0;
        }
        
        .sidebar-item {
          background-color: #3a3a3a;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          color: #e5e5e5;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .sidebar-item:hover {
          background-color: #4a4a4a;
        }
        
        .controls-section {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-bottom: 1.5rem;
        }
        
        .control-button {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: none;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .control-button.primary {
          background-color: #86F5FF;
          color: black;
        }
        
        .control-button.primary:hover {
          background-color: #5FE3F0;
        }
        
        .control-button.secondary {
          background-color: #3a3a3a;
          color: #e5e5e5;
        }
        
        .control-button.secondary:hover {
          background-color: #4a4a4a;
        }
        
        .image-gallery {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .gallery-images {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }
        
        .gallery-image {
          width: 100%;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #3a3a3a;
          position: relative;
        }
        
        .image-container {
          position: relative;
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
        
        .drop-zone {
          border: 2px dashed #6b7280;
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.03);
        }
        
        .drop-zone:hover {
          border-color: #86F5FF;
          background: rgba(134, 245, 255, 0.1);
        }
        
        .drop-zone.dragging {
          border-color: #86F5FF;
          background: rgba(134, 245, 255, 0.2);
          transform: scale(1.02);
        }
        
        .drop-zone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: #9ca3af;
        }
        
        .drop-zone-icon {
          color: #86F5FF;
        }
        
        .drop-zone-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: #e5e5e5;
        }
        
        .drop-zone-hint {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .loading-section {
          background-color: #3a3a3a;
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .loading-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #86F5FF;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .loading-progress {
          width: 100%;
          height: 6px;
          background-color: #2a2a2a;
          border-radius: 3px;
          overflow: hidden;
        }
        
        .loading-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #86F5FF, #5FE3F0);
          transition: width 0.3s ease;
        }
        
        .loading-text {
          font-size: 0.75rem;
          color: #9ca3af;
        }
        
        @media (max-width: 768px) {
          .viewer-content {
            flex-direction: column;
          }
          
          .sidebar {
            width: 100%;
          }
        }
      `}</style>
      
      <div className="viewer-container" style={{ background: backgroundColor }}>
        <div className="viewer-content">
          <div className="sidebar">
            {/* Loading/Rendering Status */}
            {isLoading && (
              <div className="loading-section">
                <div className="loading-header">
                  <Loader2 size={16} className="loading-spinner" />
                  Rendering Model
                </div>
                <div className="loading-progress">
                  <div 
                    className="loading-progress-bar" 
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <div className="loading-text">
                  {loadingProgress}% complete
                </div>
              </div>
            )}

            {/* Prompt Editor */}
            {currentPrompt && (
              <div className="sidebar-section">
                <h2 className="sidebar-title">Prompt</h2>
                <textarea
                  value={currentPrompt}
                  onChange={(e) => setCurrentPrompt(e.target.value)}
                  placeholder="Enter your prompt..."
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(134, 245, 255, 0.1)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    color: '#e5e5e5',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    border: '1px solid rgba(134, 245, 255, 0.2)',
                    resize: 'none',
                    height: '110px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    overflowY: 'auto'
                  }}
                />
              </div>
            )}

            {/* Upload Section */}
            <div className="sidebar-section">
              <h2 className="sidebar-title">Upload Images</h2>
              
              {/* Drag and Drop Zone */}
              <div
                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("imageUploadViewer")?.click()}
              >
                <input
                  id="imageUploadViewer"
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <div className="drop-zone-content">
                  <Upload size={24} className="drop-zone-icon" />
                  <div className="drop-zone-text">
                    {isDragging ? 'Drop here' : 'Drop images'}
                  </div>
                  <div className="drop-zone-hint">
                    or click to browse
                  </div>
                </div>
              </div>
              
              {/* Image Gallery */}
              {allImages.length > 0 && (
                <>
                  <h3 style={{ 
                    color: '#e5e5e5', 
                    fontSize: '0.875rem', 
                    fontWeight: '500',
                    margin: '0.5rem 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Uploaded
                  </h3>
                  <div className="gallery-images">
                    {allImages.map((image: string, index: number) => (
                    <div key={index} className="image-container">
                      <img
                        src={image}
                        alt={`Reference ${index + 1}`}
                        className="gallery-image"
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
                </>
              )}
            </div>
            
            <div className="controls-section">
              <button 
                className="control-button primary"
                onClick={handleSave}
                disabled={uploadedImages.length === 0}
              >
                Render Model
              </button>
              <button 
                className="control-button secondary"
                onClick={handleReset}
                disabled={uploadedImages.length === 0}
              >
                Reset
              </button>
            </div>
          </div>
          
          <div className={`canvas-container ${isFullscreen ? 'fullscreen' : ''}`}>
            <button 
              className="info-button"
              onClick={() => setShowInfoPopup(!showInfoPopup)}
              aria-label="Show info"
            >
              <Info size={20} />
            </button>
            
            <button 
              className="fullscreen-button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            
            {showInfoPopup && (
              <div className="info-popup-container">
                <div className="info-popup">
                  <h3 className="info-popup-title">How to Use</h3>
                  <div className="info-steps">
                    <div className="info-step">
                      <div className="info-step-icon">📸</div>
                      <h4 className="info-step-title">Direction Change</h4>
                      <p className="info-step-description">
                        Move your head left and right to change directions
                      </p>
                    </div>
                    <div className="info-step">
                      <div className="info-step-icon">✨</div>
                      <h4 className="info-step-title">Render Model</h4>
                      <p className="info-step-description">
                        Click save to generate your 3D model from images
                      </p>
                    </div>
                    <div className="info-step">
                      <div className="info-step-icon">🎮</div>
                      <h4 className="info-step-title">Explore</h4>
                      <p className="info-step-description">
                        View and interact with your generated 3D scene
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="checkered-placeholder">
              
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
