import React from 'react';
import styled from 'styled-components';
import { Project } from '../types/Project';

interface ProjectTooltipProps {
  project: Project;
  x: number;
  y: number;
  visible: boolean;
}

const TooltipContainer = styled.div<{ x: number; y: number; visible: boolean }>`
  position: fixed;
  left: ${props => props.x + 15}px;
  top: ${props => props.y - 10}px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 0;
  width: 320px;
  z-index: 1000;
  opacity: ${props => props.visible ? 1 : 0};
  transform: ${props => props.visible ? 'scale(1)' : 'scale(0.95)'};
  transition: all 0.2s ease-in-out;
  pointer-events: none;
  border: 1px solid #e0e0e0;
  overflow: hidden;
`;

const ProjectImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px 12px 0 0;
`;

const ProjectContent = styled.div`
  padding: 16px;
`;

const ProjectTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.3;
`;

const ProjectLocation = styled.p`
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
`;

const ProjectDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailLabel = styled.span`
  font-size: 11px;
  color: #95a5a6;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
`;

const DetailValue = styled.span`
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
`;

const MarketBadge = styled.span<{ market: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  background-color: ${props => {
    switch (props.market) {
      case 'PreK-12': return '#e8f5e8';
      case 'Higher Education': return '#e3f2fd';
      case 'CTE & STEM': return '#fff3e0';
      case 'Athletics': return '#fce4ec';
      case 'Fine Arts': return '#f3e5f5';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.market) {
      case 'PreK-12': return '#2e7d32';
      case 'Higher Education': return '#1565c0';
      case 'CTE & STEM': return '#ef6c00';
      case 'Athletics': return '#c2185b';
      case 'Fine Arts': return '#7b1fa2';
      default: return '#616161';
    }
  }};
`;

const ProjectDescription = styled.p`
  margin: 0;
  font-size: 13px;
  color: #5d6d7e;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProjectTooltip: React.FC<ProjectTooltipProps> = ({ project, x, y, visible }) => {
  return (
    <TooltipContainer x={x} y={y} visible={visible}>
      <ProjectImage 
        src={project.image_path} 
        alt={project.name}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = `${process.env.PUBLIC_URL}/images/placeholder.jpg`; // Fallback image
        }}
      />
      <ProjectContent>
        <MarketBadge market={project.market}>{project.market}</MarketBadge>
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
      </ProjectContent>
    </TooltipContainer>
  );
};

export default ProjectTooltip; 