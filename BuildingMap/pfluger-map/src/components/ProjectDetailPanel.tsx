import React from 'react';
import styled from 'styled-components';
import { Project } from '../types/Project';

interface ProjectDetailPanelProps {
  project: Project | null;
  onView360?: (project: Project) => void;
  onClose?: () => void;
}

const PanelContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
`;

const PanelHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #888;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: #2a2a2a;
    color: #B22222;
  }
`;

const ProjectImage = styled.img`
  width: 100%;
  height: 240px;
  object-fit: cover;
`;

const ProjectContent = styled.div`
  padding: 20px;
  flex: 1;
  overflow-y: auto;
`;

const ProjectTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #e0e0e0;
  line-height: 1.3;
`;

const ProjectLocation = styled.p`
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #B22222;
  font-weight: 500;
`;

const MarketBadge = styled.span<{ market: string }>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
  background-color: ${props => {
    switch (props.market) {
      case 'PreK-12': return 'rgba(46, 125, 50, 0.2)';
      case 'Higher Education': return 'rgba(21, 101, 192, 0.2)';
      case 'CTE & STEM': return 'rgba(239, 108, 0, 0.2)';
      case 'Athletics': return 'rgba(194, 24, 91, 0.2)';
      case 'Fine Arts': return 'rgba(123, 31, 162, 0.2)';
      default: return 'rgba(97, 97, 97, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.market) {
      case 'PreK-12': return '#4caf50';
      case 'Higher Education': return '#2196f3';
      case 'CTE & STEM': return '#ff9800';
      case 'Athletics': return '#e91e63';
      case 'Fine Arts': return '#9c27b0';
      default: return '#9e9e9e';
    }
  }};
`;

const ProjectDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailLabel = styled.span`
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const DetailValue = styled.span`
  font-size: 16px;
  color: #e0e0e0;
  font-weight: 600;
`;

const ProjectDescription = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #b0b0b0;
  line-height: 1.6;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 16px 20px;
  background: linear-gradient(135deg, #B22222 0%, #8B0000 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 16px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(178, 34, 34, 0.4);
    background: linear-gradient(135deg, #DC143C 0%, #B22222 100%);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Has360Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(178, 34, 34, 0.2);
  color: #B22222;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  color: #666;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
  color: #888;
`;

const ProjectDetailPanel: React.FC<ProjectDetailPanelProps> = ({ 
  project, 
  onView360, 
  onClose 
}) => {
  if (!project) {
    return (
      <PanelContainer>
        <EmptyState>
          <EmptyStateIcon>🗺️</EmptyStateIcon>
          <EmptyStateText>
            Select a project marker on the map<br/>
            to view detailed information
          </EmptyStateText>
        </EmptyState>
      </PanelContainer>
    );
  }

  // Build the correct image URL
  const getImageUrl = (project: Project) => {
    if (project.image_path) {
      const cleanPath = project.image_path.replace(/^\/+/, '');
      return `${process.env.PUBLIC_URL}/${cleanPath}`;
    }
    return `${process.env.PUBLIC_URL}/images/placeholder.jpg`;
  };

  const has360Image = project.domeMetadata?.equirectangularImage?.url && 
                      project.domeMetadata.equirectangularImage.url.trim() !== '';

  return (
    <PanelContainer>
      <PanelHeader>
        <div>
          <MarketBadge market={project.market}>{project.market}</MarketBadge>
          {has360Image && (
            <Has360Badge>
              🌐 360° Available
            </Has360Badge>
          )}
        </div>
        {onClose && (
          <CloseButton onClick={onClose} title="Close panel">
            ×
          </CloseButton>
        )}
      </PanelHeader>

      <ProjectImage 
        src={getImageUrl(project)} 
        alt={project.name}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = `${process.env.PUBLIC_URL}/images/placeholder.jpg`;
        }}
      />

      <ProjectContent>
        <ProjectTitle>{project.name}</ProjectTitle>
        <ProjectLocation>{project.location}</ProjectLocation>
        
        <ProjectDetails>
          <DetailItem>
            <DetailLabel>Year Built</DetailLabel>
            <DetailValue>{project.year_built}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Size</DetailLabel>
            <DetailValue>{project.size}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Cost</DetailLabel>
            <DetailValue>{project.cost}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>State</DetailLabel>
            <DetailValue>{project.state}</DetailValue>
          </DetailItem>
        </ProjectDetails>
        
        <ProjectDescription>{project.description}</ProjectDescription>
        
        {has360Image && onView360 && (
          <ActionButton onClick={() => onView360(project)}>
            🌐 Experience in 360°
          </ActionButton>
        )}
      </ProjectContent>
    </PanelContainer>
  );
};

export default ProjectDetailPanel; 