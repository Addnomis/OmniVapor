// VirtualTourSystem.tsx - 360° Virtual Tour System for Architectural Projects

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

interface MultiUserState {
  sessionId: string;
  isHost: boolean;
  connectedUsers: number;
  userList: Array<{
    id: string;
    name: string;
    isHost: boolean;
    joinedAt: number;
  }>;
  syncEnabled: boolean;
  lastSyncTimestamp: number;
}

interface SyncMessage {
  type: 'tour_start' | 'tour_pause' | 'tour_resume' | 'waypoint_change' | 'user_join' | 'user_leave' | 'sync_request';
  data: any;
  timestamp: number;
  userId: string;
  sessionId: string;
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

const MultiUserPanel = styled.div<{ isDomeMode: boolean }>`
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

const UserItem = styled.div<{ isHost: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  font-size: 12px;
  color: ${props => props.isHost ? '#f39c12' : '#ecf0f1'};
`;

const SyncStatus = styled.div<{ synced: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${props => props.synced ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)'};
  border: 1px solid ${props => props.synced ? '#2ecc71' : '#e74c3c'};
  border-radius: 6px;
  font-size: 11px;
  margin-bottom: 10px;
`;

const SyncControls = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const SyncButton = styled.button<{ variant?: 'sync' | 'host' }>`
  background: ${props => props.variant === 'host' ? '#f39c12' : '#3498db'};
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

  const [multiUserState, setMultiUserState] = useState<MultiUserState>({
    sessionId: '',
    isHost: false,
    connectedUsers: 1,
    userList: [],
    syncEnabled: false,
    lastSyncTimestamp: 0
  });

  const tourTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);

  // Initialize multi-user session
  useEffect(() => {
    const sessionId = `tour-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userId = `user-${Math.random().toString(36).substr(2, 9)}`;
    
    setMultiUserState(prev => ({
      ...prev,
      sessionId,
      userList: [{
        id: userId,
        name: 'You',
        isHost: true,
        joinedAt: Date.now()
      }],
      isHost: true
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

  // Multi-user sync functions
  const broadcastSyncMessage = useCallback((message: Omit<SyncMessage, 'timestamp' | 'userId' | 'sessionId'>) => {
    if (!multiUserState.syncEnabled || !websocketRef.current) return;

    const syncMessage: SyncMessage = {
      ...message,
      timestamp: Date.now(),
      userId: multiUserState.userList[0]?.id || '',
      sessionId: multiUserState.sessionId
    };

    if (websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(syncMessage));
    }

    // TODO: Integrate with dome service for multi-user broadcasting
    // domeService.broadcastToAllUsers(syncMessage);
  }, [multiUserState.syncEnabled, multiUserState.sessionId, multiUserState.userList, isDomeMode]);

  const handleSyncMessage = useCallback((message: SyncMessage) => {
    // Ignore messages from self
    if (message.userId === multiUserState.userList[0]?.id) return;

    setMultiUserState(prev => ({ ...prev, lastSyncTimestamp: message.timestamp }));

    switch (message.type) {
      case 'tour_start':
        setTourState(prev => ({
          ...prev,
          isActive: true,
          isPlaying: true,
          currentIndex: message.data.currentIndex || 0,
          progress: 0,
          timeRemaining: tourDuration
        }));
        break;

      case 'tour_pause':
        setTourState(prev => ({ ...prev, isPlaying: message.data.isPlaying }));
        break;

      case 'waypoint_change':
        setTourState(prev => ({
          ...prev,
          currentIndex: message.data.currentIndex,
          progress: message.data.progress || 0,
          timeRemaining: message.data.timeRemaining || tourDuration
        }));
        break;

      case 'user_join':
        setMultiUserState(prev => ({
          ...prev,
          connectedUsers: prev.connectedUsers + 1,
          userList: [...prev.userList, message.data.user]
        }));
        break;

      case 'user_leave':
        setMultiUserState(prev => ({
          ...prev,
          connectedUsers: Math.max(1, prev.connectedUsers - 1),
          userList: prev.userList.filter(user => user.id !== message.data.userId)
        }));
        break;
    }
  }, [multiUserState.userList, tourDuration]);

  const enableSync = useCallback(() => {
    setMultiUserState(prev => ({ ...prev, syncEnabled: true }));
    
    // TODO: In a real implementation, this would connect to a WebSocket server
    // and integrate with dome service for multi-user sync
    // if (isDomeMode) {
    //   domeService.enableMultiUserSync(multiUserState.sessionId);
    //   domeService.onEvent('syncMessage', handleSyncMessage);
    // }
  }, [multiUserState.sessionId, isDomeMode, handleSyncMessage]);

  const becomeHost = useCallback(() => {
    setMultiUserState(prev => ({
      ...prev,
      isHost: true,
      userList: prev.userList.map(user => 
        user.id === prev.userList[0]?.id 
          ? { ...user, isHost: true }
          : { ...user, isHost: false }
      )
    }));

    broadcastSyncMessage({
      type: 'user_join',
      data: { user: { ...multiUserState.userList[0], isHost: true } }
    });
  }, [multiUserState.userList, broadcastSyncMessage]);

  // Handle tour progression with sync
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

    // Broadcast to other users
    if (multiUserState.syncEnabled && multiUserState.isHost) {
      broadcastSyncMessage({
        type: 'tour_start',
        data: { currentIndex: 0 }
      });
    }
  }, [tourState.waypoints, tourDuration, isDomeMode, multiUserState.syncEnabled, multiUserState.isHost, broadcastSyncMessage]);

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
      
      // Broadcast pause/resume to other users
      if (multiUserState.syncEnabled && multiUserState.isHost) {
        broadcastSyncMessage({
          type: 'tour_pause',
          data: { isPlaying: newPlaying }
        });
      }
      
      return { ...prev, isPlaying: newPlaying };
    });
  }, [multiUserState.syncEnabled, multiUserState.isHost, broadcastSyncMessage]);

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

      // Broadcast waypoint change to other users
      if (multiUserState.syncEnabled && multiUserState.isHost) {
        broadcastSyncMessage({
          type: 'waypoint_change',
          data: {
            currentIndex: nextIndex,
            progress: 0,
            timeRemaining: tourDuration
          }
        });
      }

      return newState;
    });
  }, [tourDuration, stopTour, multiUserState.syncEnabled, multiUserState.isHost, broadcastSyncMessage]);

  const previousProject = useCallback(() => {
    setTourState(prev => {
      const prevIndex = prev.currentIndex > 0 ? prev.currentIndex - 1 : prev.waypoints.length - 1;
      
      const newState = {
        ...prev,
        currentIndex: prevIndex,
        progress: 0,
        timeRemaining: tourDuration
      };

      // Broadcast waypoint change to other users
      if (multiUserState.syncEnabled && multiUserState.isHost) {
        broadcastSyncMessage({
          type: 'waypoint_change',
          data: {
            currentIndex: prevIndex,
            progress: 0,
            timeRemaining: tourDuration
          }
        });
      }

      return newState;
    });
  }, [tourDuration, multiUserState.syncEnabled, multiUserState.isHost, broadcastSyncMessage]);

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
      // Only handle gesture controls for multi-user sync compatibility
      if (event.type === 'gesture' && event.data === 'swipe_left') {
        // Only host can control tour in sync mode
        if (!multiUserState.syncEnabled || multiUserState.isHost) {
          nextProject();
        }
      } else if (event.type === 'gesture' && event.data === 'swipe_right') {
        // Only host can control tour in sync mode
        if (!multiUserState.syncEnabled || multiUserState.isHost) {
          previousProject();
        }
      } else if (event.type === 'gesture' && event.data === 'tap') {
        // Only host can control tour in sync mode
        if (!multiUserState.syncEnabled || multiUserState.isHost) {
          pauseTour();
        }
      }
    };

    domeService.onEvent('domeInteraction', handleDomeInteraction);
  }, [isDomeMode, nextProject, previousProject, pauseTour, multiUserState.syncEnabled, multiUserState.isHost]);

  const currentWaypoint = tourState.waypoints[tourState.currentIndex];
  const currentProjectData = currentWaypoint?.project || currentProject;

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
          {multiUserState.syncEnabled && !multiUserState.isHost && (
            <HintItem>🔒 Host controls tour</HintItem>
          )}
        </InteractionHints>
      )}

      <MultiUserPanel isDomeMode={isDomeMode}>
        <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>
          Multi-User Session
        </div>
        
        <SyncStatus synced={multiUserState.syncEnabled}>
          {multiUserState.syncEnabled ? (
            <>🟢 Synchronized ({multiUserState.connectedUsers} users)</>
          ) : (
            <>🔴 Not synchronized</>
          )}
        </SyncStatus>

        <UserList>
          {multiUserState.userList.map(user => (
            <UserItem key={user.id} isHost={user.isHost}>
              {user.isHost ? '👑' : '👤'} {user.name}
              {user.isHost && ' (Host)'}
            </UserItem>
          ))}
        </UserList>

        <SyncControls>
          {!multiUserState.syncEnabled ? (
            <SyncButton onClick={enableSync}>
              Enable Sync
            </SyncButton>
          ) : (
            !multiUserState.isHost && (
              <SyncButton variant="host" onClick={becomeHost}>
                Become Host
              </SyncButton>
            )
          )}
        </SyncControls>
      </MultiUserPanel>

              <TourControls isDomeMode={isDomeMode}>
          {!tourState.isActive ? (
            <ControlButton 
              variant="primary" 
              onClick={startTour}
              disabled={multiUserState.syncEnabled && !multiUserState.isHost}
            >
              ▶️ Start Tour
            </ControlButton>
          ) : (
            <>
              <ControlButton 
                onClick={previousProject}
                disabled={multiUserState.syncEnabled && !multiUserState.isHost}
              >
                ⏮️ Previous
              </ControlButton>
              
              <ControlButton 
                onClick={pauseTour}
                disabled={multiUserState.syncEnabled && !multiUserState.isHost}
              >
                {tourState.isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </ControlButton>
              
              <ProgressBar>
                <ProgressFill progress={tourState.progress} />
              </ProgressBar>
            
                          <ControlButton 
                onClick={nextProject}
                disabled={multiUserState.syncEnabled && !multiUserState.isHost}
              >
                ⏭️ Next
              </ControlButton>
              
              <ControlButton 
                variant="danger" 
                onClick={stopTour}
                disabled={multiUserState.syncEnabled && !multiUserState.isHost}
              >
                ⏹️ Stop
              </ControlButton>
            </>
          )}
          
          {multiUserState.syncEnabled && !multiUserState.isHost && (
            <div style={{ 
              fontSize: '11px', 
              color: '#f39c12', 
              textAlign: 'center',
              marginTop: '5px'
            }}>
              🔒 Host is controlling the tour
            </div>
          )}
        </TourControls>
    </TourContainer>
  );
};

export default VirtualTourSystem; 