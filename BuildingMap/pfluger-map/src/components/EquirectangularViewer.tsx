// EquirectangularViewer.tsx - 360° image viewer component for dome projection

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { EquirectangularMetadata, DomeCoordinates } from '../types/DomeProjection';
import domeService from '../services/DomeIntegrationService';

interface EquirectangularViewerProps {
  imageUrl: string;
  metadata?: EquirectangularMetadata;
  onViewChange?: (coordinates: DomeCoordinates) => void;
  enableInteraction?: boolean;
  domeOptimized?: boolean;
  className?: string;
}

interface ViewState {
  yaw: number;    // Horizontal rotation
  pitch: number;  // Vertical rotation
  fov: number;    // Field of view
}

const EquirectangularViewer: React.FC<EquirectangularViewerProps> = ({
  imageUrl,
  metadata,
  onViewChange,
  enableInteraction = true,
  domeOptimized = false,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewState, setViewState] = useState<ViewState>({
    yaw: 0,
    pitch: 0,
    fov: metadata?.fieldOfView || 90
  });

  const imageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize the viewer
  useEffect(() => {
    loadImage();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [imageUrl]);

  // Render when view state changes
  useEffect(() => {
    if (isLoaded && imageRef.current) {
      renderFrame();
    }
  }, [viewState, isLoaded]);

  // Handle dome integration
  useEffect(() => {
    if (domeService.inDomeEnvironment && domeOptimized) {
      // Register for dome events
      domeService.onEvent('domeInteraction', handleDomeInteraction);
      
      // Send initial render command to dome
      if (imageUrl && metadata) {
        domeService.renderEquirectangular(imageUrl, metadata);
      }
    }
  }, [imageUrl, metadata, domeOptimized]);

  const loadImage = useCallback(() => {
    setIsLoaded(false);
    setError(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      imageRef.current = img;
      setIsLoaded(true);
      renderFrame();
    };
    
    img.onerror = () => {
      setError('Failed to load equirectangular image');
    };
    
    img.src = imageUrl;
  }, [imageUrl]);

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const { yaw, pitch, fov } = viewState;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (domeOptimized && domeService.inDomeEnvironment) {
      // In dome environment, let OmniMap handle the rendering
      // Just show a placeholder or control interface
      renderDomePlaceholder(ctx, width, height);
    } else {
      // Standard web view - render equirectangular projection
      renderEquirectangularView(ctx, image, width, height, yaw, pitch, fov);
    }
  }, [viewState, domeOptimized]);

  const renderDomePlaceholder = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Placeholder for dome environment
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🔮 Dome Projection Active', width / 2, height / 2 - 20);
    ctx.fillText('View controls available in dome', width / 2, height / 2 + 20);
    
    // Draw dome coordinate indicator
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 100;
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw current view direction
    const angle = (viewState.yaw * Math.PI) / 180;
    const x = centerX + Math.cos(angle) * radius * 0.8;
    const y = centerY + Math.sin(angle) * radius * 0.8;
    
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  };

  const renderEquirectangularView = (
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    width: number,
    height: number,
    yaw: number,
    pitch: number,
    fov: number
  ) => {
    // Simplified equirectangular to rectilinear projection
    // This is a basic implementation - a full implementation would use WebGL
    
    const aspectRatio = width / height;
    const fovRad = (fov * Math.PI) / 180;
    const yawRad = (yaw * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;
    
    // Sample the equirectangular image
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        // Convert screen coordinates to spherical coordinates
        const screenX = (x / width) * 2 - 1;
        const screenY = (y / height) * 2 - 1;
        
        const phi = Math.atan2(screenX * Math.tan(fovRad / 2), 1) + yawRad;
        const theta = Math.atan2(screenY * Math.tan(fovRad / 2) / aspectRatio, 1) + pitchRad;
        
        // Convert to equirectangular coordinates
        const u = ((phi + Math.PI) / (2 * Math.PI)) * image.width;
        const v = ((theta + Math.PI / 2) / Math.PI) * image.height;
        
        if (u >= 0 && u < image.width && v >= 0 && v < image.height) {
          // Sample pixel from source image
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = 1;
          tempCanvas.height = 1;
          const tempCtx = tempCanvas.getContext('2d')!;
          
          tempCtx.drawImage(image, u, v, 1, 1, 0, 0, 1, 1);
          const pixel = tempCtx.getImageData(0, 0, 1, 1);
          
          ctx.fillStyle = `rgb(${pixel.data[0]}, ${pixel.data[1]}, ${pixel.data[2]})`;
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!enableInteraction) return;
    setIsDragging(true);
    e.preventDefault();
  }, [enableInteraction]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !enableInteraction) return;
    
    const sensitivity = 0.5;
    const deltaX = e.movementX * sensitivity;
    const deltaY = e.movementY * sensitivity;
    
    setViewState(prev => {
      const newYaw = prev.yaw - deltaX;
      const newPitch = Math.max(-90, Math.min(90, prev.pitch - deltaY));
      
      const newState = { ...prev, yaw: newYaw, pitch: newPitch };
      
      // Notify parent component of view change
      if (onViewChange) {
        const domeCoords: DomeCoordinates = {
          azimuth: newYaw,
          elevation: newPitch,
          distance: 0.8
        };
        onViewChange(domeCoords);
      }
      
      return newState;
    });
  }, [isDragging, enableInteraction, onViewChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!enableInteraction) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? 5 : -5;
    
    setViewState(prev => ({
      ...prev,
      fov: Math.max(30, Math.min(120, prev.fov + delta))
    }));
  }, [enableInteraction]);

  const handleDomeInteraction = useCallback((event: any) => {
    // Handle interaction events from dome
    if (event.type === 'gaze') {
      setViewState(prev => ({
        ...prev,
        yaw: event.position.azimuth,
        pitch: event.position.elevation
      }));
    }
  }, []);

  // Resize canvas to container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      
      if (canvas && container) {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        renderFrame();
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [renderFrame]);

  if (error) {
    return (
      <div className={`equirectangular-error ${className}`}>
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={loadImage}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`equirectangular-viewer ${className} ${domeOptimized ? 'dome-optimized' : ''}`}
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        cursor: enableInteraction ? (isDragging ? 'grabbing' : 'grab') : 'default'
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'block'
        }}
      />
      
      {!isLoaded && (
        <div className="loading-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white'
        }}>
          <div>Loading 360° view...</div>
        </div>
      )}
      
      {enableInteraction && (
        <div className="viewer-controls" style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          color: 'white',
          fontSize: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '5px 10px',
          borderRadius: '5px'
        }}>
          <div>Yaw: {viewState.yaw.toFixed(1)}°</div>
          <div>Pitch: {viewState.pitch.toFixed(1)}°</div>
          <div>FOV: {viewState.fov.toFixed(1)}°</div>
          {domeService.inDomeEnvironment && <div>🔮 Dome Mode</div>}
        </div>
      )}
    </div>
  );
};

export default EquirectangularViewer; 