// DomeProjection.ts - Type definitions for dome projection system

export interface DomeCoordinates {
  azimuth: number;    // Horizontal angle (0-360°)
  elevation: number;  // Vertical angle (-90° to 90°)
  distance: number;   // Distance from dome center (0-1)
}

export interface EquirectangularMetadata {
  width: number;
  height: number;
  fieldOfView: number;  // Horizontal FOV in degrees
  projection: 'equirectangular' | 'cylindrical' | 'spherical';
  optimizedForDome: boolean;
}

export interface DomeProjectionSettings {
  domeRadius: number;
  projectorCount: number;
  blendOverlap: number;
  fisheye: {
    enabled: boolean;
    strength: number;
    centerX: number;
    centerY: number;
  };
  channels: DomeChannel[];
}

export interface DomeChannel {
  id: string;
  name: string;
  position: DomeCoordinates;
  resolution: {
    width: number;
    height: number;
  };
  blendRegion: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
}

export interface DomeInteractionEvent {
  type: 'gaze' | 'gesture' | 'voice' | 'controller';
  position: DomeCoordinates;
  data: any;
  timestamp: number;
}

export interface DomeNavigationState {
  currentProject: string | null;
  viewMode: 'map' | 'project' | 'tour' | 'presentation';
  isImmersive: boolean;
  selectedRegion: string | null;
  zoomLevel: number;
}

export interface OmniMapBridge {
  // Communication with C++ OmniMap layer
  sendCommand(command: string, data: any): Promise<any>;
  onEvent(eventType: string, callback: (data: any) => void): void;
  
  // Dome control functions
  setProjection(settings: DomeProjectionSettings): Promise<void>;
  updateView(coordinates: DomeCoordinates): Promise<void>;
  renderEquirectangular(imageUrl: string, metadata: EquirectangularMetadata): Promise<void>;
  
  // Interaction handling
  enableInteraction(enabled: boolean): Promise<void>;
  calibrateInput(): Promise<void>;
}

export interface DomeUIElement {
  id: string;
  type: 'button' | 'panel' | 'tooltip' | 'menu';
  position: DomeCoordinates;
  size: {
    width: number;
    height: number;
  };
  curved: boolean;
  followGaze: boolean;
  content: React.ReactNode;
}

// Enhanced Project type with dome-specific metadata
export interface DomeProject {
  id: string;
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    domePosition?: DomeCoordinates;
  };
  images: {
    thumbnail: string;
    equirectangular?: string;
    metadata?: EquirectangularMetadata;
  };
  category: string;
  year: number;
  domeMetadata?: {
    preferredViewAngle: DomeCoordinates;
    tourWaypoints: DomeCoordinates[];
    interactionZones: Array<{
      position: DomeCoordinates;
      radius: number;
      action: string;
    }>;
  };
} 