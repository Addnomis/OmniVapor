// Utility to add 360° image metadata to projects for tour system testing
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

  return projects.map((project, index) => {
    // Add 360° images to first few projects for testing
    if (index < available360Images.length) {
      const imageFileName = available360Images[index];
      
      return {
        ...project,
        domeMetadata: {
          equirectangularImage: {
            url: `${process.env.PUBLIC_URL}/images/360_Images/${imageFileName}`,
            metadata: {
              width: 4096,
              height: 2048,
              fieldOfView: 360,
              projection: 'equirectangular' as const,
              optimizedForDome: true
            }
          },
          preferredViewAngle: {
            azimuth: Math.random() * 360,
            elevation: Math.random() * 30 - 15, // -15 to +15 degrees
            distance: 0.8
          },
          interactionZones: [
            {
              position: {
                azimuth: Math.random() * 360,
                elevation: Math.random() * 20 - 10,
                distance: 0.9
              },
              radius: 0.1,
              action: 'highlight',
              description: `Key feature of ${project.name}`
            }
          ],
          tourWaypoints: [
            {
              azimuth: 0,
              elevation: 0,
              distance: 0.8
            },
            {
              azimuth: 90,
              elevation: 10,
              distance: 0.8
            },
            {
              azimuth: 180,
              elevation: 5,
              distance: 0.8
            }
          ],
          immersiveFeatures: {
            supports360View: true,
            supportsVirtualTour: true,
            hasInteractiveElements: true
          }
        }
      };
    }
    
    return project;
  });
}; 