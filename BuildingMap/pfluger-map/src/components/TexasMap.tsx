import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import styled from 'styled-components';
import * as d3 from 'd3';
import { Project } from '../types/Project';
import ProjectDetailPanel from './ProjectDetailPanel';
import 'leaflet/dist/leaflet.css';

interface TexasMapProps {
  projects: Project[];
  onProjectSelect?: (project: Project) => void;
  onProjectImmersive?: (project: Project) => void;
}

const MapWrapper = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  display: flex;
  background: #0f0f0f;
`;

const LeftSidebar = styled.div`
  width: 320px;
  height: 100vh;
  background: #1a1a1a;
  border-right: 1px solid #333;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);
  padding: 20px;
  overflow-y: auto;
  z-index: 1000;
  order: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RightSidePanel = styled.div<{ isOpen: boolean }>`
  width: ${props => props.isOpen ? '400px' : '0px'};
  height: 100vh;
  background: #1a1a1a;
  box-shadow: ${props => props.isOpen ? '-2px 0 20px rgba(0, 0, 0, 0.5)' : 'none'};
  transition: width 0.3s ease-in-out;
  overflow: hidden;
  z-index: 1000;
  position: relative;
  border-left: ${props => props.isOpen ? '1px solid #333' : 'none'};
  order: 3;
`;

const MapSection = styled.div`
  flex: 1;
  height: 100vh;
  position: relative;
  background: #0f0f0f;
  order: 2;
`;

const MapContainer_Styled = styled(MapContainer)`
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const FilterPanel = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  padding: 20px;
  margin-bottom: 20px;
  min-width: 250px;
`;

const FilterTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #e0e0e0;
`;

const FilterGroup = styled.div`
  margin-bottom: 16px;
`;

const FilterLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #b0b0b0;
  margin-bottom: 8px;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #444;
  border-radius: 6px;
  font-size: 14px;
  background: #2a2a2a;
  color: #e0e0e0;
  
  &:focus {
    outline: none;
    border-color: #B22222;
  }

  option {
    background: #2a2a2a;
    color: #e0e0e0;
  }
`;

const LegendContainer = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  padding: 20px;
`;

const LegendTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #e0e0e0;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-right: 8px;
  border: 2px solid white;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
`;

const LegendText = styled.span`
  font-size: 13px;
  color: #b0b0b0;
`;

const StatsContainer = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  padding: 20px;
`;

const InstructionPanel = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  padding: 16px;
`;

const InstructionTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #B22222;
`;

const InstructionText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #b0b0b0;
  line-height: 1.4;
`;

const StatItem = styled.div`
  margin-bottom: 12px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #B22222;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const TexasMap: React.FC<TexasMapProps> = ({ 
  projects, 
  onProjectSelect, 
  onProjectImmersive 
}) => {
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const mapRef = useRef<any>(null);

  // Color scale for different markets
  const marketColors = {
    'PreK-12': '#27ae60',
    'Higher Education': '#3498db',
    'CTE & STEM': '#f39c12',
    'Athletics': '#e74c3c',
    'Fine Arts': '#9b59b6',
    'Other': '#95a5a6'
  };

  // Size scale based on year built (newer = larger)
  const sizeScale = d3.scaleLinear()
    .domain(d3.extent(projects, d => d.year_built) as [number, number])
    .range([10, 22]); // Slightly larger for better clicking

  // Filter projects based on selected market
  useEffect(() => {
    if (selectedMarket === 'all') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(p => p.market === selectedMarket));
    }
  }, [selectedMarket, projects]);

  // Update selected project when projects change
  useEffect(() => {
    if (selectedProject && !projects.find(p => p.name === selectedProject.name)) {
      setSelectedProject(null);
    }
  }, [projects, selectedProject]);

  // Get unique markets for filter
  const markets = Array.from(new Set(projects.map(p => p.market)));

  // Calculate statistics
  const totalProjects = filteredProjects.length;
  const projects360 = filteredProjects.filter(p => p.domeMetadata?.equirectangularImage?.url).length;
  const avgCost = filteredProjects.reduce((sum, p) => {
    const cost = parseFloat(p.cost.replace(/[$M,]/g, ''));
    return sum + cost;
  }, 0) / filteredProjects.length;
  const avgSize = filteredProjects.reduce((sum, p) => sum + p.size_sf, 0) / filteredProjects.length;

  return (
    <MapWrapper>
      {/* Left Sidebar with all controls */}
      <LeftSidebar>
        {/* Filter Panel */}
        <FilterPanel>
          <FilterTitle>Filters</FilterTitle>
          <FilterGroup>
            <FilterLabel>Market Type</FilterLabel>
            <FilterSelect
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
            >
              <option value="all">All Markets</option>
              {markets.map(market => (
                <option key={market} value={market}>{market}</option>
              ))}
            </FilterSelect>
          </FilterGroup>
        </FilterPanel>

        {/* Statistics Panel */}
        <StatsContainer>
          <StatItem>
            <StatValue>{totalProjects}</StatValue>
            <StatLabel>Total Projects</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{projects360}</StatValue>
            <StatLabel>360° Available</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>${avgCost.toFixed(1)}M</StatValue>
            <StatLabel>Avg Cost</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{(avgSize / 1000).toFixed(0)}K</StatValue>
            <StatLabel>Avg Size (SF)</StatLabel>
          </StatItem>
        </StatsContainer>

        {/* Legend */}
        <LegendContainer>
          <LegendTitle>Market Types</LegendTitle>
          {Object.entries(marketColors).map(([market, color]) => (
            <LegendItem key={market}>
              <LegendColor color={color} />
              <LegendText>{market}</LegendText>
            </LegendItem>
          ))}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #333' }}>
            <LegendItem>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                borderRadius: '50%', 
                background: '#2a2a2a',
                border: '3px solid #B22222',
                marginRight: '8px'
              }} />
              <LegendText style={{ fontSize: '11px' }}>360° Available</LegendText>
            </LegendItem>
            <LegendText style={{ fontSize: '11px', color: '#95a5a6', marginTop: '8px' }}>
              Size = Year Built (newer = larger)
            </LegendText>
          </div>
        </LegendContainer>

        {/* Instructions */}
        <InstructionPanel>
          <InstructionTitle>🌐 360° Viewing Available</InstructionTitle>
          <InstructionText>
            • Click any project marker to view details in sidebar<br/>
            • Projects with red borders have 360° images<br/>
            • Click "Experience in 360°" button for immersive viewing<br/>
            • All 61 projects have 360° architectural views
          </InstructionText>
        </InstructionPanel>
      </LeftSidebar>

      {/* Map Section */}
      <MapSection>
        <MapContainer_Styled
          center={[31.9686, -99.9018]} // Center of Texas
          zoom={6}
          ref={mapRef}
        >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {filteredProjects.map((project, index) => {
          const has360 = project.domeMetadata?.equirectangularImage?.url;
          return (
            <CircleMarker
              key={index}
              center={[project.latitude, project.longitude]}
              radius={sizeScale(project.year_built)}
              fillColor={marketColors[project.market as keyof typeof marketColors]}
              color={has360 ? "#B22222" : "#666"}
              weight={has360 ? 3 : 2}
              opacity={1}
              fillOpacity={has360 ? 0.9 : 0.8}
            eventHandlers={{
              click: (e) => {
                console.log('Marker clicked:', project.name);
                setSelectedProject(project);
                
                // Also call the parent handlers if needed
                if (onProjectSelect) {
                  onProjectSelect(project);
                }
              }
            }}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h4 style={{ margin: '0 0 8px 0' }}>{project.name}</h4>
                <p style={{ margin: '4px 0' }}><strong>Location:</strong> {project.location}</p>
                <p style={{ margin: '4px 0' }}><strong>Year:</strong> {project.year_built}</p>
                <p style={{ margin: '4px 0' }}><strong>Size:</strong> {project.size}</p>
                <p style={{ margin: '4px 0' }}><strong>Cost:</strong> {project.cost}</p>
              </div>
            </Popup>
          </CircleMarker>
          );
        })}
      </MapContainer_Styled>
      </MapSection>

      {/* Right Sidebar Panel */}
      <RightSidePanel isOpen={!!selectedProject}>
        <ProjectDetailPanel
          project={selectedProject}
          onView360={onProjectImmersive}
          onClose={() => setSelectedProject(null)}
        />
      </RightSidePanel>
    </MapWrapper>
  );
};

export default TexasMap; 