export interface Project {
  name: string;
  location: string;
  market: 'PreK-12' | 'Higher Education' | 'CTE & STEM' | 'Athletics' | 'Fine Arts' | 'Other';
  jurisdiction: string;
  size: string;
  image_url: string;
  image_path: string;
  project_url: string;
  year_built: number;
  size_sf: number;
  cost: string;
  description: string;
  state: string;
  latitude: number;
  longitude: number;
}

// Enhanced project interface for dome projection
export interface DomeEnhancedProject extends Project {
  // Dome-specific enhancements
  equirectangularImage?: string;        // 2D image as 360° placeholder
  domeMetadata?: {
    optimizedForDome: boolean;          // Whether image is dome-ready
    recommendedViewingAngle: number;    // Optimal dome viewing angle (degrees)
    projectionType: 'equirectangular' | 'fisheye' | 'standard';
    transitionDuration: number;         // Animation timing for dome (ms)
    spatialPosition: {                  // Position in dome space
      x: number;
      y: number;
      z: number;
    };
  };
  
  // Progressive image loading variants
  imageVariants?: {
    thumbnail: string;                  // Quick preview (< 50KB)
    low: string;                       // Low resolution (< 200KB)
    medium: string;                    // Medium resolution (< 500KB)
    high: string;                      // High resolution (< 2MB)
  };
}

// Dome projection configuration
export interface DomeConfiguration {
  // Physical dome properties
  domeRadius: number;                   // Physical dome radius in meters
  projectorPosition: Vector3D;          // Projector location
  fisheyeLensAngle: number;            // Fisheye lens field of view (degrees)
  
  // Projection settings
  multiChannelEnabled: boolean;         // Use multiple projection channels
  channelCount: number;                // Number of projection channels
  blendingEnabled: boolean;            // Edge blending between channels
  
  // Performance settings
  targetFrameRate: number;             // Target FPS (typically 60)
  maxTextureSize: number;              // Maximum texture resolution
  enableGPUAcceleration: boolean;      // Use GPU for processing
  
  // Interaction settings
  gestureRecognition: boolean;         // Enable gesture controls
  voiceControl: boolean;               // Enable voice commands
  touchSensitivity: number;            // Touch/gesture sensitivity (0-1)
}

// 3D Vector for spatial positioning
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

// Dome display options
export interface DomeDisplayOptions {
  transition?: 'fade' | 'slide' | 'zoom' | 'none';
  duration?: number;                   // Transition duration in ms
  optimizeForDome?: boolean;           // Apply dome-specific optimizations
  preloadNext?: boolean;               // Preload next likely images
}

// Dome display result
export interface DomeDisplayResult {
  success: boolean;
  projectionActive: boolean;
  error?: string;
  performanceMetrics?: {
    loadTime: number;                  // Image load time in ms
    renderTime: number;                // Render time in ms
    memoryUsage: number;               // Memory usage in MB
  };
}

// Map tooltip data structure
export interface MapTooltipData {
  project: Project | DomeEnhancedProject;
  x: number;
  y: number;
  domeMode?: boolean;                  // Whether tooltip is in dome mode
}

// Navigation and interaction types
export type TransitionType = 'fade' | 'slide' | 'zoom' | 'none';
export type ProjectionType = 'equirectangular' | 'fisheye' | 'standard';
export type ViewMode = 'web' | 'dome' | 'hybrid';

// Equirectangular image properties
export interface EquirectangularImageProps {
  src: string;                         // 2D image source (placeholder for 360°)
  aspectRatio?: number;                // Maintain 2:1 aspect ratio for equirectangular
  domeOptimized?: boolean;             // Flag for dome-specific optimizations
  fallbackSrc?: string;                // Fallback image if primary fails
  onLoad?: () => void;                 // Callback when image loads
  onError?: (error: Error) => void;    // Callback on load error
}

// Performance monitoring
export interface PerformanceMetrics {
  frameRate: number;                   // Current FPS
  memoryUsage: number;                 // Memory usage in MB
  cpuUtilization: number;              // CPU usage percentage
  gpuUtilization: number;              // GPU usage percentage
  imageLoadTime: number;               // Average image load time
  renderLatency: number;               // Render latency in ms
}

// System capabilities check
export interface DomeHardwareCheck {
  gpuCompatible: boolean;              // GPU meets requirements
  projectorConnected: boolean;         // Projector is connected
  fisheyeLensCalibrated: boolean;      // Lens calibration status
  multiChannelSupported: boolean;      // Multi-channel support
  performanceMeetsRequirements: boolean; // Overall performance check
}

// Error types for dome integration
export class DomeConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomeConnectionError';
  }
}

export class ImageLoadError extends Error {
  constructor(message: string, public imageUrl: string) {
    super(message);
    this.name = 'ImageLoadError';
  }
}

export class ProjectionError extends Error {
  constructor(message: string, public projectionType?: ProjectionType) {
    super(message);
    this.name = 'ProjectionError';
  }
} 