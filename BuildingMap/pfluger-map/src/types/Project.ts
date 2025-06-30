import { DomeCoordinates, EquirectangularMetadata } from './DomeProjection';

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
  
  // Enhanced dome projection metadata
  domeMetadata?: {
    preferredViewAngle?: DomeCoordinates;
    tourWaypoints?: DomeCoordinates[];
    interactionZones?: Array<{
      position: DomeCoordinates;
      radius: number;
      action: string;
      description?: string;
    }>;
    equirectangularImage?: {
      url: string;
      metadata: EquirectangularMetadata;
    };
    immersiveFeatures?: {
      supports360View: boolean;
      supportsVirtualTour: boolean;
      hasInteractiveElements: boolean;
    };
  };
}

export interface MapTooltipData {
  project: Project;
  x: number;
  y: number;
}