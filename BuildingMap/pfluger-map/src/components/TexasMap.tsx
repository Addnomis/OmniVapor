import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import styled from 'styled-components';
import * as d3 from 'd3';
import { Project } from '../types/Project';
import ProjectTooltip from './ProjectTooltip';
import 'leaflet/dist/leaflet.css';

interface TexasMapProps {
  projects: Project[];
  onProjectSelect?: (project: Project) => void;
  onProjectImmersive?: (project: Project) => void;
  isDomeMode?: boolean;
}

const MapWrapper = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
`;

const MapContainer_Styled = styled(MapContainer)`
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const FilterPanel = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 1000;
  min-width: 250px;
`;

const FilterTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
`;

const FilterGroup = styled.div`
  margin-bottom: 16px;
`;

const FilterLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #34495e;
  margin-bottom: 8px;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #2c3e50;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const LegendContainer = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 1000;
`;

const LegendTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
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
  color: #2c3e50;
`;

const StatsContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 1000;
  min-width: 200px;
`;

const StatItem = styled.div`
  margin-bottom: 12px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #7f8c8d;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const TexasMap: React.FC<TexasMapProps> = ({ 
  projects, 
  onProjectSelect, 
  onProjectImmersive, 
  isDomeMode = false 
}) => {
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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
    .range([8, 20]);

  // Filter projects based on selected market
  useEffect(() => {
    if (selectedMarket === 'all') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(p => p.market === selectedMarket));
    }
  }, [selectedMarket, projects]);

  // Track mouse position for tooltip
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Get unique markets for filter
  const markets = Array.from(new Set(projects.map(p => p.market)));

  // Calculate statistics
  const totalProjects = filteredProjects.length;
  const avgCost = filteredProjects.reduce((sum, p) => {
    const cost = parseFloat(p.cost.replace(/[$M,]/g, ''));
    return sum + cost;
  }, 0) / filteredProjects.length;
  const avgSize = filteredProjects.reduce((sum, p) => sum + p.size_sf, 0) / filteredProjects.length;

  return (
    <MapWrapper>
      <MapContainer_Styled
        center={[31.9686, -99.9018]} // Center of Texas
        zoom={6}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {filteredProjects.map((project, index) => (
          <CircleMarker
            key={index}
            center={[project.latitude, project.longitude]}
            radius={sizeScale(project.year_built)}
            fillColor={marketColors[project.market as keyof typeof marketColors]}
            color="white"
            weight={2}
            opacity={1}
            fillOpacity={0.8}
            eventHandlers={{
              mouseover: () => setHoveredProject(project),
              mouseout: () => setHoveredProject(null),
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
        ))}
      </MapContainer_Styled>

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
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
          <LegendText style={{ fontSize: '11px', color: '#95a5a6' }}>
            Size = Year Built (newer = larger)
          </LegendText>
        </div>
      </LegendContainer>

      {/* Tooltip */}
      {hoveredProject && (
        <ProjectTooltip
          project={hoveredProject}
          x={mousePosition.x}
          y={mousePosition.y}
          visible={!!hoveredProject}
        />
      )}
    </MapWrapper>
  );
};

export default TexasMap; 