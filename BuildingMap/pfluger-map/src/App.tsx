import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import TexasMap from './components/TexasMap';
import EquirectangularViewer from './components/EquirectangularViewer';
// import VirtualTourSystem from './components/VirtualTourSystem';
import { Project } from './types/Project';
import domeService from './services/DomeIntegrationService';
import { DomeNavigationState } from './types/DomeProjection';
import { add360ImagesToProjects } from './utils/add360Images';

const AppContainer = styled.div`
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: white;
  margin-left: 20px;
  font-size: 18px;
  font-weight: 500;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f8f9fa;
  flex-direction: column;
`;

const ErrorText = styled.h2`
  color: #e74c3c;
  margin-bottom: 16px;
`;

const ErrorDescription = styled.p`
  color: #7f8c8d;
  text-align: center;
  max-width: 500px;
`;

const Header = styled.header`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px 0;
  z-index: 1001;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
`;

const ProjectInfoOverlay = styled.div`
  position: absolute;
  top: 100px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  max-width: 400px;
  z-index: 1000;
`;

const ProjectTitle = styled.h2`
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
`;

const ProjectDetails = styled.div`
  font-size: 14px;
  color: #bdc3c7;
  line-height: 1.5;
  
  strong {
    color: #ecf0f1;
  }
`;

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [domeNavigationState, setDomeNavigationState] = useState<DomeNavigationState | null>(null);
  const [isDomeEnvironment, setIsDomeEnvironment] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/final_pfluger_projects.json`);
        if (!response.ok) {
          throw new Error(`Failed to load project data: ${response.status}`);
        }
        const data: Project[] = await response.json();
        // Add random 360° images to all projects
        const projectsWith360Images = add360ImagesToProjects(data);
        setProjects(projectsWith360Images);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project data');
        console.error('Error loading projects:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Initialize dome service and listen for events
  useEffect(() => {
    const initializeDome = async () => {
      // Wait for dome service to initialize
      if (domeService.initialized) {
        setIsDomeEnvironment(domeService.inDomeEnvironment);
        setDomeNavigationState(domeService.currentNavigationState);
      }
    };

    initializeDome();

    // Listen for dome events
    domeService.onEvent('initialized', (data) => {
      setIsDomeEnvironment(data.isDomeEnvironment);
    });

    domeService.onEvent('navigationStateChange', (state) => {
      setDomeNavigationState(state);
    });

    domeService.onEvent('domeInteraction', (event) => {
      console.log('🔮 Dome interaction received:', event);
    });
  }, []);

  // Keep this for dome immersive mode compatibility
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    
    if (isDomeEnvironment) {
      // Navigate to project in dome
      domeService.navigateToProject(project.name);
    }
  };

  const handleEnterImmersiveMode = async (project: Project) => {
    if (isDomeEnvironment && project.domeMetadata?.equirectangularImage) {
      await domeService.enterImmersiveMode(project.name);
    }
  };

  const handleExitImmersiveMode = async () => {
    if (isDomeEnvironment) {
      await domeService.exitImmersiveMode();
      setSelectedProject(null);
    }
  };

  const handleShowProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
    if (isDomeEnvironment) {
      domeService.setViewMode('project');
    }
  };

  const handleBackToMap = () => {
    setShowProjectDetails(false);
    setSelectedProject(null);
    if (isDomeEnvironment) {
      domeService.setViewMode('map');
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading Pfluger Architects Projects...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorText>Error Loading Data</ErrorText>
        <ErrorDescription>
          {error}. Please check that the project data file is available and try refreshing the page.
        </ErrorDescription>
      </ErrorContainer>
    );
  }

  return (
    <AppContainer>
      <Header>
        <HeaderContent>
          <div>
            <Title>Pfluger Architects Portfolio Map</Title>
            <Subtitle>
              Interactive map of {projects.length} architectural projects across Texas and Louisiana
              {isDomeEnvironment && ' 🔮 Dome Mode Active'}
            </Subtitle>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {showProjectDetails && selectedProject && (
              <button 
                onClick={handleBackToMap}
                style={{
                  padding: '8px 16px',
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                ← Back to Map
              </button>
            )}
            
            {isDomeEnvironment && (
              <>
                {domeNavigationState?.isImmersive && (
                  <button 
                    onClick={handleExitImmersiveMode}
                    style={{
                      padding: '8px 16px',
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Exit Immersive Mode
                  </button>
                )}
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                  🔮 Dome Mode: {domeNavigationState?.viewMode || 'map'}
                </div>
              </>
            )}
          </div>
        </HeaderContent>
      </Header>
      <div style={{ paddingTop: '80px' }}>
        {showProjectDetails && selectedProject?.domeMetadata?.equirectangularImage ? (
          <>
            <EquirectangularViewer
              imageUrl={selectedProject.domeMetadata.equirectangularImage.url}
              metadata={selectedProject.domeMetadata.equirectangularImage.metadata}
              domeOptimized={isDomeEnvironment}
              onViewChange={(coordinates) => {
                if (isDomeEnvironment) {
                  domeService.updateView(coordinates);
                }
              }}
            />
            <ProjectInfoOverlay>
              <ProjectTitle>{selectedProject.name}</ProjectTitle>
              <ProjectDetails>
                <div><strong>Location:</strong> {selectedProject.location}</div>
                <div><strong>Market:</strong> {selectedProject.market}</div>
                <div><strong>Year:</strong> {selectedProject.year_built}</div>
                <div><strong>Size:</strong> {selectedProject.size}</div>
                <div><strong>Cost:</strong> {selectedProject.cost}</div>
                <div style={{ marginTop: '10px' }}>{selectedProject.description}</div>
              </ProjectDetails>
            </ProjectInfoOverlay>
            
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '15px',
              borderRadius: '10px',
              fontSize: '12px',
              maxWidth: '200px',
              zIndex: 1000
            }}>
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>360° Navigation</div>
              <div>🖱️ Drag to look around</div>
              <div>🔍 Scroll to zoom</div>
              {isDomeEnvironment && <div>🎯 Dome optimized view</div>}
            </div>
          </>
        ) : domeNavigationState?.isImmersive && selectedProject?.domeMetadata?.equirectangularImage ? (
          <EquirectangularViewer
            imageUrl={selectedProject.domeMetadata.equirectangularImage.url}
            metadata={selectedProject.domeMetadata.equirectangularImage.metadata}
            domeOptimized={isDomeEnvironment}
            onViewChange={(coordinates) => {
              if (isDomeEnvironment) {
                domeService.updateView(coordinates);
              }
            }}
          />
        ) : (
          <TexasMap 
            projects={projects} 
            onProjectSelect={handleShowProjectDetails}
            onProjectImmersive={handleEnterImmersiveMode}
            isDomeMode={isDomeEnvironment}
          />
        )}
      </div>
    </AppContainer>
  );
};

export default App;
