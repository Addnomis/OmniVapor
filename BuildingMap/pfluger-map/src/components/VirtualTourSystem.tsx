// VirtualTourSystem.tsx - 360° Virtual Tour System for Single Dome Multi-User Experience

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { Project } from '../types/Project';
import { DomeCoordinates, DomeNavigationState } from '../types/DomeProjection';
import EquirectangularViewer from './EquirectangularViewer';
import domeService from '../services/DomeIntegrationService';

interface VirtualTourSystemProps {
  projects: Project[];
  currentProject?: Project;
  onProjectChange?: (project: Project) => void;
  onTourComplete?: () => void;
  isDomeMode?: boolean;
  autoAdvance?: boolean;
  tourDuration?: number; // seconds per project
}

interface TourWaypoint {
  project: Project;
  viewAngle: DomeCoordinates;
  duration: number;
  description: string;
  interactionPoints?: Array<{
    position: DomeCoordinates;
    action: string;
    label: string;
  }>;
}

interface TourState {
  isActive: boolean;
  currentIndex: number;
  isPlaying: boolean;
  progress: number;
  waypoints: TourWaypoint[];
  timeRemaining: number;
}

interface SingleDomeUserState {
  sessionId: string;
  currentPresenter: string | null;
  audienceCount: number;
  userList: Array<{
    id: string;
    name: string;
    role: 'presenter' | 'audience';
    device: 'dome_controller' | 'tablet' | 'phone' | 'kiosk';
    joinedAt: number;
  }>;
  presenterMode: boolean;
  audienceInteraction: boolean; // Allow audience to suggest next project
  lastInteractionTimestamp: number;
}

interface DomeInteractionMessage {
  type: 'presenter_change' | 'tour_control' | 'audience_suggestion' | 'user_join' | 'user_leave';
  data: any;
  timestamp: number;
  userId: string;
  userRole: 'presenter' | 'audience';
  deviceType: string;
}

const TourContainer = styled.div<{ isDomeMode: boolean }>`
  position: relative;
  width: 100%;
  height: 100vh;
  background: ${props => props.isDomeMode ? 'transparent' : '#000'};
  overflow: hidden;
`;

const TourControls = styled.div<{ isDomeMode: boolean }>`
  position: absolute;
  bottom: ${props => props.isDomeMode ? '40px' : '20px'};
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(0, 0, 0, 0.8);
  padding: 15px 25px;
  border-radius: ${props => props.isDomeMode ? '25px' : '15px'};
  backdrop-filter: blur(10px);
  z-index: 1000;
  min-width: 400px;
  justify-content: center;
`;

const ControlButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  background: ${props => {
    switch (props.variant) {
      case 'primary': return '#3498db';
      case 'danger': return '#e74c3c';
      default: return '#34495e';
    }
  }};
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin: 0 15px;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
  border-radius: 2px;
`;

const TourInfo = styled.div<{ isDomeMode: boolean }>`
  position: absolute;
  top: ${props => props.isDomeMode ? '40px' : '20px'};
  left: ${props => props.isDomeMode ? '40px' : '20px'};
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: ${props => props.isDomeMode ? '20px' : '12px'};
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
`;

const WaypointIndicator = styled.div`
  font-size: 12px;
  color: #3498db;
  margin-top: 10px;
  font-weight: 500;
`;

const InteractionHints = styled.div<{ isDomeMode: boolean }>`
  position: absolute;
  top: 50%;
  right: ${props => props.isDomeMode ? '40px' : '20px'};
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px;
  border-radius: ${props => props.isDomeMode ? '15px' : '10px'};
  backdrop-filter: blur(10px);
  z-index: 1000;
  max-width: 200px;
`;

const HintItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #ecf0f1;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DomeUserPanel = styled.div<{ isDomeMode: boolean }>`
  position: absolute;
  top: ${props => props.isDomeMode ? '40px' : '20px'};
  right: ${props => props.isDomeMode ? '40px' : '20px'};
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: ${props => props.isDomeMode ? '15px' : '10px'};
  backdrop-filter: blur(10px);
  z-index: 1000;
  min-width: 250px;
`;

const UserList = styled.div`
  margin-bottom: 15px;
`;

const UserItem = styled.div<{ isPresenter: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  font-size: 12px;
  color: ${props => props.isPresenter ? '#f39c12' : '#ecf0f1'};
`;

const PresenterStatus = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${props => props.active ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)'};
  border: 1px solid ${props => props.active ? '#2ecc71' : '#e74c3c'};
  border-radius: 6px;
  font-size: 11px;
  margin-bottom: 10px;
`;

const DomeControls = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const DomeButton = styled.button<{ variant?: 'presenter' | 'audience' }>`
  background: ${props => props.variant === 'presenter' ? '#f39c12' : '#3498db'};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const VirtualTourSystem: React.FC<VirtualTourSystemProps> = ({
  projects,
  currentProject,
  onProjectChange,
  onTourComplete,
  isDomeMode = false,
  autoAdvance = false,
  tourDuration = 30
}) => {
  const [tourState, setTourState] = useState<TourState>({
    isActive: false,
    currentIndex: 0,
    isPlaying: false,
    progress: 0,
    waypoints: [],
    timeRemaining: 0
  });

  const [currentViewAngle, setCurrentViewAngle] = useState<DomeCoordinates>({
    azimuth: 0,
    elevation: 0,
    distance: 0.8
  });

  const [domeUserState, setDomeUserState] = useState<SingleDomeUserState>({
    sessionId: '',
    currentPresenter: null,
    audienceCount: 0,
    userList: [],
    presenterMode: false,
    audienceInteraction: true,
    lastInteractionTimestamp: 0
  });

  const tourTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize single dome session
  useEffect(() => {
    const sessionId = `dome-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userId = `user-${Math.random().toString(36).substr(2, 9)}`;
    
    setDomeUserState((prev: SingleDomeUserState) => ({
      ...prev,
      sessionId,
      currentPresenter: userId,
      userList: [{
        id: userId,
        name: 'Dome Controller',
        role: 'presenter' as const,
        device: 'dome_controller' as const,
        joinedAt: Date.now()
      }],
      presenterMode: true
    }));
  }, []);

  // Initialize tour waypoints
  useEffect(() => {
    const createTourWaypoints = (): TourWaypoint[] => {
      return projects
        .filter(project => project.domeMetadata?.equirectangularImage)
        .map((project, index) => ({
          project,
          viewAngle: project.domeMetadata?.preferredViewAngle || {
            azimuth: 0,
            elevation: 0,
            distance: 0.8
          },
          duration: tourDuration,
          description: `${project.name} - ${project.location}`,
          interactionPoints: project.domeMetadata?.interactionZones?.map(zone => ({
            position: zone.position,
            action: zone.action,
            label: zone.description || zone.action
          })) || []
        }));
    };

    setTourState(prev => ({
      ...prev,
      waypoints: createTourWaypoints()
    }));
  }, [projects, tourDuration]);

  // Single dome interaction functions
  const broadcastDomeMessage = useCallback((message: Omit<DomeInteractionMessage, 'timestamp' | 'userId' | 'userRole' | 'deviceType'>) => {
    const currentUser = domeUserState.userList[0];
    if (!currentUser) return;

    const domeMessage: DomeInteractionMessage = {
      ...message,
      timestamp: Date.now(),
      userId: currentUser.id,
      userRole: currentUser.role,
      deviceType: currentUser.device
    };

    // TODO: Broadcast to connected devices (tablets, phones, kiosks) in dome
    // domeService.broadcastToDevices(domeMessage);
  }, [domeUserState.userList]);

  const enablePresenterMode = useCallback(() => {
    setDomeUserState((prev: SingleDomeUserState) => ({ 
      ...prev, 
      presenterMode: true 
    }));
    
    // TODO: Enable presenter mode in dome service
    // if (isDomeMode) {
    //   domeService.enablePresenterMode(domeUserState.sessionId);
    // }
  }, [domeUserState.sessionId]);

  const toggleAudienceInteraction = useCallback(() => {
    setDomeUserState((prev: SingleDomeUserState) => ({
      ...prev,
      audienceInteraction: !prev.audienceInteraction
    }));
  }, []);

  // Handle tour progression
  const startTour = useCallback(() => {
    if (tourState.waypoints.length === 0) return;

    const newState = {
      isActive: true,
      isPlaying: true,
      currentIndex: 0,
      progress: 0,
      timeRemaining: tourDuration
    };

    setTourState(prev => ({ ...prev, ...newState }));

    if (isDomeMode) {
      domeService.setViewMode('tour');
    }

    // Broadcast to connected devices in dome
    if (domeUserState.presenterMode && domeUserState.currentPresenter) {
      broadcastDomeMessage({
        type: 'tour_control',
        data: { action: 'start', currentIndex: 0 }
      });
    }
  }, [tourState.waypoints, tourDuration, isDomeMode, domeUserState.presenterMode, domeUserState.currentPresenter, broadcastDomeMessage]);

  const stopTour = useCallback(() => {
    if (tourTimerRef.current) clearInterval(tourTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);

    setTourState(prev => ({
      ...prev,
      isActive: false,
      isPlaying: false,
      progress: 0
    }));

    if (isDomeMode) {
      domeService.setViewMode('map');
    }

    onTourComplete?.();
  }, [isDomeMode, onTourComplete]);

  const pauseTour = useCallback(() => {
    setTourState(prev => {
      const newPlaying = !prev.isPlaying;
      
      // Broadcast pause/resume to connected devices
      if (domeUserState.presenterMode && domeUserState.currentPresenter) {
        broadcastDomeMessage({
          type: 'tour_control',
          data: { action: newPlaying ? 'resume' : 'pause' }
        });
      }
      
      return { ...prev, isPlaying: newPlaying };
    });
  }, [domeUserState.presenterMode, domeUserState.currentPresenter, broadcastDomeMessage]);

  const nextProject = useCallback(() => {
    setTourState(prev => {
      const nextIndex = (prev.currentIndex + 1) % prev.waypoints.length;
      const isComplete = nextIndex === 0 && prev.currentIndex > 0;
      
      if (isComplete) {
        stopTour();
        return prev;
      }

      const newState = {
        ...prev,
        currentIndex: nextIndex,
        progress: 0,
        timeRemaining: tourDuration
      };

      // Broadcast waypoint change to connected devices
      if (domeUserState.presenterMode && domeUserState.currentPresenter) {
        broadcastDomeMessage({
          type: 'tour_control',
          data: {
            action: 'next',
            currentIndex: nextIndex,
            timeRemaining: tourDuration
          }
        });
      }

      return newState;
    });
  }, [tourDuration, stopTour, domeUserState.presenterMode, domeUserState.currentPresenter, broadcastDomeMessage]);

  const previousProject = useCallback(() => {
    setTourState(prev => {
      const prevIndex = prev.currentIndex > 0 ? prev.currentIndex - 1 : prev.waypoints.length - 1;
      
      const newState = {
        ...prev,
        currentIndex: prevIndex,
        progress: 0,
        timeRemaining: tourDuration
      };

      // Broadcast waypoint change to connected devices
      if (domeUserState.presenterMode && domeUserState.currentPresenter) {
        broadcastDomeMessage({
          type: 'tour_control',
          data: {
            action: 'previous',
            currentIndex: prevIndex,
            timeRemaining: tourDuration
          }
        });
      }

      return newState;
    });
  }, [tourDuration, domeUserState.presenterMode, domeUserState.currentPresenter, broadcastDomeMessage]);

  // Auto-advance timer
  useEffect(() => {
    if (!tourState.isActive || !tourState.isPlaying || !autoAdvance) return;

    tourTimerRef.current = setInterval(() => {
      setTourState(prev => {
        if (prev.timeRemaining <= 1) {
          nextProject();
          return prev;
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        };
      });
    }, 1000);

    return () => {
      if (tourTimerRef.current) clearInterval(tourTimerRef.current);
    };
  }, [tourState.isActive, tourState.isPlaying, autoAdvance, nextProject]);

  // Progress bar timer
  useEffect(() => {
    if (!tourState.isActive || !tourState.isPlaying) return;

    progressTimerRef.current = setInterval(() => {
      setTourState(prev => ({
        ...prev,
        progress: ((tourDuration - prev.timeRemaining) / tourDuration) * 100
      }));
    }, 100);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [tourState.isActive, tourState.isPlaying, tourDuration]);

  // Update current project when tour index changes
  useEffect(() => {
    if (tourState.isActive && tourState.waypoints.length > 0) {
      const currentWaypoint = tourState.waypoints[tourState.currentIndex];
      if (currentWaypoint) {
        setCurrentViewAngle(currentWaypoint.viewAngle);
        onProjectChange?.(currentWaypoint.project);
        
        if (isDomeMode) {
          domeService.navigateToProject(currentWaypoint.project.name);
          domeService.updateView(currentWaypoint.viewAngle);
        }
      }
    }
  }, [tourState.currentIndex, tourState.waypoints, onProjectChange, isDomeMode]);

  // Handle dome gesture interactions (no voice commands)
  useEffect(() => {
    if (!isDomeMode) return;

    const handleDomeInteraction = (event: any) => {
      // Only handle gesture controls, presenter controls tour
      const isPresenter = domeUserState.currentPresenter === domeUserState.userList[0]?.id;
      
      if (event.type === 'gesture' && event.data === 'swipe_left') {
        if (!domeUserState.presenterMode || isPresenter) {
          nextProject();
        }
      } else if (event.type === 'gesture' && event.data === 'swipe_right') {
        if (!domeUserState.presenterMode || isPresenter) {
          previousProject();
        }
      } else if (event.type === 'gesture' && event.data === 'tap') {
        if (!domeUserState.presenterMode || isPresenter) {
          pauseTour();
        }
      }
    };

    domeService.onEvent('domeInteraction', handleDomeInteraction);
  }, [isDomeMode, nextProject, previousProject, pauseTour, domeUserState.presenterMode, domeUserState.currentPresenter, domeUserState.userList]);

  const currentWaypoint = tourState.waypoints[tourState.currentIndex];
  const currentProjectData = currentWaypoint?.project || currentProject;
  const isPresenter = domeUserState.currentPresenter === domeUserState.userList[0]?.id;

  if (!currentProjectData?.domeMetadata?.equirectangularImage) {
    return (
      <TourContainer isDomeMode={isDomeMode}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'white',
          fontSize: '18px'
        }}>
          No 360° images available for virtual tour
        </div>
      </TourContainer>
    );
  }

  return (
    <TourContainer isDomeMode={isDomeMode}>
      <EquirectangularViewer
        imageUrl={currentProjectData.domeMetadata.equirectangularImage.url}
        metadata={currentProjectData.domeMetadata.equirectangularImage.metadata}
        domeOptimized={isDomeMode}
        onViewChange={(coordinates) => {
          setCurrentViewAngle(coordinates);
          if (isDomeMode) {
            domeService.updateView(coordinates);
          }
        }}
      />

      <TourInfo isDomeMode={isDomeMode}>
        <ProjectTitle>{currentProjectData.name}</ProjectTitle>
        <ProjectDetails>
          <div><strong>Location:</strong> {currentProjectData.location}</div>
          <div><strong>Market:</strong> {currentProjectData.market}</div>
          <div><strong>Year:</strong> {currentProjectData.year_built}</div>
          <div><strong>Size:</strong> {currentProjectData.size}</div>
        </ProjectDetails>
        {tourState.isActive && (
          <WaypointIndicator>
            Project {tourState.currentIndex + 1} of {tourState.waypoints.length}
            {autoAdvance && ` • ${tourState.timeRemaining}s remaining`}
          </WaypointIndicator>
        )}
      </TourInfo>

      {isDomeMode && (
        <InteractionHints isDomeMode={isDomeMode}>
          <HintItem>👆 Drag to look around</HintItem>
          <HintItem>👈 Swipe left for next</HintItem>
          <HintItem>👉 Swipe right for previous</HintItem>
          <HintItem>👆 Tap to pause/play</HintItem>
          {domeUserState.presenterMode && !isPresenter && (
            <HintItem>🎯 Presenter controls tour</HintItem>
          )}
        </InteractionHints>
      )}

      <DomeUserPanel isDomeMode={isDomeMode}>
        <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>
          Single Dome Session
        </div>
        
        <PresenterStatus active={domeUserState.presenterMode}>
          {domeUserState.presenterMode ? (
            <>🎯 Presenter Mode Active</>
          ) : (
            <>👥 Collaborative Mode</>
          )}
        </PresenterStatus>

        <UserList>
          {domeUserState.userList.map(user => (
            <UserItem key={user.id} isPresenter={user.role === 'presenter'}>
              {user.role === 'presenter' ? '🎯' : '👤'} {user.name}
              {user.role === 'presenter' && ' (Presenter)'}
            </UserItem>
          ))}
          <UserItem isPresenter={false}>
            👥 Audience: {domeUserState.audienceCount} users
          </UserItem>
        </UserList>

        <DomeControls>
          {!domeUserState.presenterMode ? (
            <DomeButton variant="presenter" onClick={enablePresenterMode}>
              Enable Presenter Mode
            </DomeButton>
          ) : (
            <DomeButton onClick={toggleAudienceInteraction}>
              {domeUserState.audienceInteraction ? 'Disable' : 'Enable'} Audience Input
            </DomeButton>
          )}
        </DomeControls>
      </DomeUserPanel>

      <TourControls isDomeMode={isDomeMode}>
        {!tourState.isActive ? (
          <ControlButton 
            variant="primary" 
            onClick={startTour}
            disabled={domeUserState.presenterMode && !isPresenter}
          >
            ▶️ Start Tour
          </ControlButton>
        ) : (
          <>
            <ControlButton 
              onClick={previousProject}
              disabled={domeUserState.presenterMode && !isPresenter}
            >
              ⏮️ Previous
            </ControlButton>
            
            <ControlButton 
              onClick={pauseTour}
              disabled={domeUserState.presenterMode && !isPresenter}
            >
              {tourState.isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </ControlButton>
            
            <ProgressBar>
              <ProgressFill progress={tourState.progress} />
            </ProgressBar>
            
            <ControlButton 
              onClick={nextProject}
              disabled={domeUserState.presenterMode && !isPresenter}
            >
              ⏭️ Next
            </ControlButton>
            
            <ControlButton 
              variant="danger" 
              onClick={stopTour}
              disabled={domeUserState.presenterMode && !isPresenter}
            >
              ⏹️ Stop
            </ControlButton>
          </>
        )}
        
        {domeUserState.presenterMode && !isPresenter && (
          <div style={{ 
            fontSize: '11px', 
            color: '#f39c12', 
            textAlign: 'center',
            marginTop: '5px'
          }}>
            🎯 Presenter is controlling the tour
          </div>
        )}
      </TourControls>
    </TourContainer>
  );
};

export default VirtualTourSystem; 