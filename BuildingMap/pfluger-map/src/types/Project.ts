// Simple coordinate and metadata types for 360° images
export interface DomeCoordinates {
  azimuth: number;
  elevation: number;
  distance: number;
}

export interface EquirectangularMetadata {
  width: number;
  height: number;
  fov: number;
  projection: string;
}

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
  
  // Simplified dome projection metadata for 360° viewing
  domeMetadata?: {
    preferredViewAngle?: DomeCoordinates;
    equirectangularImage?: {
      url: string;
      metadata: EquirectangularMetadata;
    };
    immersiveFeatures?: {
      supports360View: boolean;
    };
  };
}

export interface MapTooltipData {
  project: Project;
  x: number;
  y: number;
}