import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import TexasMap from './components/TexasMap';
import Simple360Viewer from './components/Simple360Viewer';
import { Project } from './types/Project';
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
  background: linear-gradient(135deg, #B22222 0%, #8B0000 100%);
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
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px 0;
  z-index: 1001;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
  color: #e0e0e0;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: #B22222;
  font-weight: 500;
`;



const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentView, setCurrentView] = useState<'map' | '360'>('map');

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





  const handleEnterImmersiveMode = (project: Project) => {
    console.log('🌐 Entering 360° view for:', project.name);
    console.log('🖼️ Image URL:', project.domeMetadata?.equirectangularImage?.url);
    
    setSelectedProject(project);
    setCurrentView('360');
  };

  const handleShowProjectDetails = (project: Project) => {
    // This is called from the map when clicking markers
    setSelectedProject(project);
  };

  const handleBackToMap = () => {
    console.log('🗺️ Back to map button clicked');
    setCurrentView('map');
    setSelectedProject(null);
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
            </Subtitle>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {currentView === '360' && (
              <button 
                onClick={handleBackToMap}
                style={{
                  padding: '8px 16px',
                  background: '#B22222',
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
          </div>
        </HeaderContent>
      </Header>
      <div style={{ paddingTop: '80px' }}>
        {currentView === '360' && selectedProject?.domeMetadata?.equirectangularImage ? (
          <Simple360Viewer
            imageUrl={selectedProject.domeMetadata.equirectangularImage.url}
            projectName={selectedProject.name}
            onBack={handleBackToMap}
          />
        ) : (
          <TexasMap 
            projects={projects} 
            onProjectSelect={handleShowProjectDetails}
            onProjectImmersive={handleEnterImmersiveMode}
          />
        )}
      </div>
    </AppContainer>
  );
};

export default App;
