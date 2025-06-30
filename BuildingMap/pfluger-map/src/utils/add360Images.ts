// Utility to add random 360° image metadata to all projects
import { Project } from '../types/Project';

export const add360ImagesToProjects = (projects: Project[]): Project[] => {
  // Sample 360° images available
  const available360Images = [
    'Edit-Cafeteria.png',
    'Edit-Classroom.png', 
    'Edit-Library.png',
    'Edit-Library2.png',
    'Edit-Outdoor.png',
    'Edit-Outdoor (2).png',
    'Edit-Outdoor (3).png',
    'Front Entry.png',
    'Patio.png',
    'Reception.png',
    'Science Classroom.png'
  ];

  return projects.map((project) => {
    // Randomly assign a 360° image to each project
    const randomImageIndex = Math.floor(Math.random() * available360Images.length);
    const imageFileName = available360Images[randomImageIndex];
    
    return {
      ...project,
      domeMetadata: {
        equirectangularImage: {
          url: `${process.env.PUBLIC_URL}/images/360_Images/${imageFileName}`,
          metadata: {
            width: 4096,
            height: 2048,
            fov: 360,
            projection: 'equirectangular' as const
          }
        },
        preferredViewAngle: {
          azimuth: Math.random() * 360,
          elevation: Math.random() * 30 - 15, // -15 to +15 degrees
          distance: 0.8
        },
        immersiveFeatures: {
          supports360View: true
        }
      }
    };
  });
}; 