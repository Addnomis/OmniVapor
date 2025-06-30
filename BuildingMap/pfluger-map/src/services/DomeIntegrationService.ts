// DomeIntegrationService.ts - Bridge between React app and OmniMap C++ layer

import { 
  DomeCoordinates, 
  DomeProjectionSettings, 
  EquirectangularMetadata, 
  OmniMapBridge,
  DomeInteractionEvent,
  DomeNavigationState
} from '../types/DomeProjection';

class DomeIntegrationService implements OmniMapBridge {
  private isInitialized = false;
  private isDomeEnvironment = false;
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();
  private navigationState: DomeNavigationState = {
    currentProject: null,
    viewMode: 'map',
    isImmersive: false,
    selectedRegion: null,
    zoomLevel: 1
  };

  constructor() {
    this.detectDomeEnvironment();
    this.initializeBridge();
  }

  private detectDomeEnvironment(): void {
    // Check if running in OmniMap dome environment
    this.isDomeEnvironment = !!(window as any).OmniMapBridge;
    
    if (this.isDomeEnvironment) {
      console.log('🔮 Dome environment detected - enabling dome features');
    } else {
      console.log('💻 Standard web environment - dome features will be simulated');
    }
  }

  private async initializeBridge(): Promise<void> {
    try {
      if (this.isDomeEnvironment) {
        // Initialize connection to C++ OmniMap layer
        const bridge = (window as any).OmniMapBridge;
        await bridge.initialize();
        
        // Set up event forwarding from C++ to React
        bridge.onNativeEvent = (eventType: string, data: any) => {
          this.handleNativeEvent(eventType, data);
        };
      }
      
      this.isInitialized = true;
      this.emit('initialized', { isDomeEnvironment: this.isDomeEnvironment });
    } catch (error) {
      console.error('Failed to initialize dome bridge:', error);
      // Fallback to simulation mode
      this.isDomeEnvironment = false;
      this.isInitialized = true;
    }
  }

  // OmniMapBridge interface implementation
  async sendCommand(command: string, data: any): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Dome bridge not initialized');
    }

    if (this.isDomeEnvironment) {
      const bridge = (window as any).OmniMapBridge;
      return await bridge.sendCommand(command, data);
    } else {
      // Simulate command execution for development
      console.log(`🔮 Simulating dome command: ${command}`, data);
      return this.simulateCommand(command, data);
    }
  }

  onEvent(eventType: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  async setProjection(settings: DomeProjectionSettings): Promise<void> {
    return this.sendCommand('setProjection', settings);
  }

  async updateView(coordinates: DomeCoordinates): Promise<void> {
    this.navigationState = {
      ...this.navigationState,
      // Update navigation state based on coordinates
    };
    
    return this.sendCommand('updateView', coordinates);
  }

  async renderEquirectangular(imageUrl: string, metadata: EquirectangularMetadata): Promise<void> {
    return this.sendCommand('renderEquirectangular', { imageUrl, metadata });
  }

  async enableInteraction(enabled: boolean): Promise<void> {
    return this.sendCommand('enableInteraction', { enabled });
  }

  async calibrateInput(): Promise<void> {
    return this.sendCommand('calibrateInput', {});
  }

  // Additional dome-specific methods
  async navigateToProject(projectId: string): Promise<void> {
    this.navigationState.currentProject = projectId;
    this.navigationState.viewMode = 'project';
    
    return this.sendCommand('navigateToProject', { projectId });
  }

  async setViewMode(mode: DomeNavigationState['viewMode']): Promise<void> {
    this.navigationState.viewMode = mode;
    
    return this.sendCommand('setViewMode', { mode });
  }

  async enterImmersiveMode(projectId: string): Promise<void> {
    this.navigationState.isImmersive = true;
    this.navigationState.currentProject = projectId;
    
    return this.sendCommand('enterImmersiveMode', { projectId });
  }

  async exitImmersiveMode(): Promise<void> {
    this.navigationState.isImmersive = false;
    
    return this.sendCommand('exitImmersiveMode', {});
  }

  // Coordinate conversion utilities
  geographicToDome(lat: number, lng: number): DomeCoordinates {
    // Convert geographic coordinates to dome coordinates
    // This is a simplified conversion - real implementation would be more complex
    const azimuth = ((lng + 180) % 360);
    const elevation = lat;
    const distance = 0.8; // Default distance from dome center
    
    return { azimuth, elevation, distance };
  }

  domeToGeographic(coordinates: DomeCoordinates): { lat: number; lng: number } {
    // Convert dome coordinates back to geographic
    const lng = coordinates.azimuth - 180;
    const lat = coordinates.elevation;
    
    return { lat, lng };
  }

  // Event handling
  private handleNativeEvent(eventType: string, data: any): void {
    this.emit(eventType, data);
    
    // Handle specific dome events
    switch (eventType) {
      case 'interaction':
        this.handleInteractionEvent(data as DomeInteractionEvent);
        break;
      case 'navigationChange':
        this.handleNavigationChange(data);
        break;
    }
  }

  private handleInteractionEvent(event: DomeInteractionEvent): void {
    // Process dome interaction events
    console.log('🔮 Dome interaction:', event);
    this.emit('domeInteraction', event);
  }

  private handleNavigationChange(data: any): void {
    // Update navigation state from dome
    this.navigationState = { ...this.navigationState, ...data };
    this.emit('navigationStateChange', this.navigationState);
  }

  private emit(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventType}:`, error);
      }
    });
  }

  // Simulation methods for development
  private async simulateCommand(command: string, data: any): Promise<any> {
    // Simulate dome commands for development/testing
    switch (command) {
      case 'setProjection':
        return { success: true, message: 'Projection settings applied (simulated)' };
      
      case 'updateView':
        return { success: true, coordinates: data };
      
      case 'renderEquirectangular':
        return { success: true, imageUrl: data.imageUrl };
      
      case 'navigateToProject':
        setTimeout(() => {
          this.emit('navigationComplete', { projectId: data.projectId });
        }, 500);
        return { success: true };
      
      default:
        return { success: true, message: `Command ${command} simulated` };
    }
  }

  // Getters
  get initialized(): boolean {
    return this.isInitialized;
  }

  get inDomeEnvironment(): boolean {
    return this.isDomeEnvironment;
  }

  get currentNavigationState(): DomeNavigationState {
    return { ...this.navigationState };
  }
}

// Export singleton instance
export const domeService = new DomeIntegrationService();
export default domeService; 