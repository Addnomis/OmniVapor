import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import TexasMap from './components/TexasMap';
import { Project } from './types/Project';

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

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/final_pfluger_projects.json`);
        if (!response.ok) {
          throw new Error(`Failed to load project data: ${response.status}`);
        }
        const data: Project[] = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project data');
        console.error('Error loading projects:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

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
            <Subtitle>Interactive map of {projects.length} architectural projects across Texas and Louisiana</Subtitle>
          </div>
        </HeaderContent>
      </Header>
      <div style={{ paddingTop: '80px' }}>
        <TexasMap projects={projects} />
      </div>
    </AppContainer>
  );
};

export default App;
