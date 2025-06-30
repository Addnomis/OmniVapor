# Application Architecture - Dome Projection System

## Executive Summary

This document outlines the high-level architecture for the Pfluger Architects Portfolio Map & Dome Projection System, an innovative architectural visualization platform that combines interactive web mapping with immersive dome projection technology.

## System Overview

### Vision Statement
Create an industry-leading architectural presentation platform that transforms traditional project portfolios into immersive, interactive dome experiences using equirectangular projection and spatial navigation.

### Core Objectives
- **Immersive Visualization**: Present architectural projects in full-dome environments
- **Interactive Navigation**: Enable intuitive spatial exploration of project portfolios
- **Scalable Architecture**: Support multiple architectural firms and project types
- **Technology Integration**: Seamlessly blend web technologies with dome projection

## Architecture Layers

### 1. Presentation Layer
**Technologies**: React 19, TypeScript, Styled Components, D3.js

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   2D Map View   │  │ Equirectangular │  │  Dome UI        │ │
│  │   (Leaflet)     │  │    Viewer       │  │  Components     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Project        │  │   Navigation    │  │   Statistics    │ │
│  │  Tooltips       │  │   Controls      │  │   Dashboard     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Components**:
- **TexasMap.tsx**: Interactive geographic visualization
- **EquirectangularViewer.tsx**: 360° image display (using 2D placeholders)
- **ProjectTooltip.tsx**: Rich project information overlays
- **DomeNavigationControls.tsx**: Spatial navigation interface
- **StatsDashboard.tsx**: Real-time project analytics

### 2. Integration Layer
**Technologies**: C++17, Chromium Embedded Framework, OmniMap SDK

```
┌─────────────────────────────────────────────────────────────┐
│                   INTEGRATION LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  WebView        │  │   Interaction   │  │  Projection     │ │
│  │  Channel        │  │   Handler       │  │  Manager        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Equirectangular │  │   Spatial       │  │   Event         │ │
│  │   Renderer      │  │  Navigation     │  │  Dispatcher     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Components**:
- **WebViewChannel.cpp**: Embeds React application in dome
- **DomeInteractionHandler.cpp**: Maps dome gestures to web events
- **EquirectangularRenderer.cpp**: Renders 360° images in dome space
- **ProjectNavigationSystem.cpp**: Handles spatial project transitions
- **EventDispatcher.cpp**: Manages communication between layers

### 3. Projection Layer
**Technologies**: OmniMap SDK, OpenGL, Lua Scripting

```
┌─────────────────────────────────────────────────────────────┐
│                    PROJECTION LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Multi-Channel │  │   Fisheye       │  │    Geometry     │ │
│  │    Rendering    │  │  Correction     │  │   Correction    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Shader        │  │   Calibration   │  │   Performance   │ │
│  │   Pipeline      │  │   System        │  │   Monitor       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Components**:
- **OmniMap Core**: Multi-channel dome rendering
- **Fisheye Correction**: Lens distortion compensation
- **Geometry Warping**: Dome surface mapping
- **Shader Pipeline**: GPU-accelerated rendering
- **Calibration System**: Projector alignment tools

### 4. Data Layer
**Technologies**: JSON, REST APIs, File System, Caching

```
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Project       │  │  Equirectangular│  │   Spatial       │ │
│  │   Metadata      │  │     Images      │  │   Index         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Cache         │  │   Configuration │  │   Analytics     │ │
│  │   Manager       │  │     Data        │  │     Data        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Components**:
- **ProjectDataService.ts**: Project metadata management
- **ImageCacheService.ts**: Efficient image loading and caching
- **SpatialIndexService.ts**: Geographic data optimization
- **ConfigurationManager.ts**: System settings and preferences
- **AnalyticsCollector.ts**: Usage tracking and metrics

## Data Flow Architecture

### Primary Data Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │───▶│   React     │───▶│ Integration │───▶│   Dome      │
│ Interaction │    │    App      │    │   Layer     │    │ Projection  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       ▲                  │                  │                  │
       │                  ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Feedback   │◀───│   Event     │◀───│   Dome      │◀───│   Visual    │
│   Loop      │    │  Handler    │    │ Interaction │    │   Output    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Data Processing Pipeline
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Web       │───▶│   Data      │───▶│ Coordinate  │───▶│   React     │
│  Scraping   │    │Enhancement  │    │   Mapping   │    │    App      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Image     │───▶│Equirectangular│───▶│   Dome      │───▶│   User      │
│ Collection  │    │  Processing │    │ Optimization│    │ Experience  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Component Interactions

### React Application Components
```typescript
// Core component hierarchy
App.tsx
├── HeaderComponent.tsx
├── TexasMap.tsx
│   ├── ProjectMarker.tsx
│   ├── FilterPanel.tsx
│   └── StatsDashboard.tsx
├── EquirectangularViewer.tsx
│   ├── ImageLoader.tsx
│   ├── NavigationControls.tsx
│   └── ProjectionControls.tsx
└── DomeIntegrationService.ts
    ├── EventBridge.ts
    ├── SpatialMapper.ts
    └── PerformanceMonitor.ts
```

### OmniMap Integration Components
```cpp
// C++ integration hierarchy
DomeProjectionSystem
├── WebViewChannel
│   ├── ChromiumEmbedded
│   ├── EventHandler
│   └── StateManager
├── EquirectangularRenderer
│   ├── TextureManager
│   ├── ShaderPipeline
│   └── GeometryWarper
└── InteractionSystem
    ├── GestureRecognizer
    ├── SpatialNavigator
    └── FeedbackController
```

## Interface Specifications

### React ↔ OmniMap Communication
```typescript
interface DomeProjectionInterface {
  // Project navigation
  navigateToProject(projectId: string, transition: TransitionType): Promise<void>;
  
  // Image display
  displayEquirectangularImage(imageUrl: string, metadata: ImageMetadata): Promise<void>;
  
  // Spatial interaction
  handleSpatialInput(input: SpatialInputEvent): void;
  
  // State synchronization
  syncState(state: ApplicationState): void;
  
  // Performance monitoring
  getPerformanceMetrics(): PerformanceMetrics;
}
```

### Data Structures
```typescript
interface EnhancedProject {
  // Existing project data
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  market: MarketType;
  
  // Enhanced dome data
  equirectangularImage: string;        // 2D image as 360° placeholder
  domeOptimized: boolean;              // Dome rendering flag
  spatialMetadata: SpatialMetadata;    // Dome positioning data
  transitionType: TransitionType;      // Navigation animation
  viewingRecommendations: ViewingHint[]; // Optimal viewing angles
}

interface SpatialMetadata {
  domePosition: Vector3D;              // Position in dome space
  viewingAngle: number;                // Optimal viewing angle
  zoomLevel: number;                   // Recommended zoom
  transitionDuration: number;          // Animation timing
}
```

## Performance Architecture

### Optimization Strategies
```
┌─────────────────────────────────────────────────────────────┐
│                  PERFORMANCE OPTIMIZATION                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Image         │  │   Rendering     │  │   Memory        │ │
│  │   Caching       │  │   Pipeline      │  │   Management    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Progressive   │  │   GPU           │  │   Network       │ │
│  │   Loading       │  │   Acceleration  │  │   Optimization  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Performance Targets
- **Frame Rate**: 60 FPS minimum for dome projection
- **Image Loading**: < 2 seconds for equirectangular images
- **Navigation**: < 500ms transition between projects
- **Memory Usage**: < 4GB total system memory
- **Startup Time**: < 10 seconds from launch to ready

## Deployment Architecture

### Development Environment
```
┌─────────────────────────────────────────────────────────────┐
│                  DEVELOPMENT ENVIRONMENT                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   React Dev     │  │   OmniMap       │  │   Content       │ │
│  │   Server        │  │   Simulator     │  │   Pipeline      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Hot Reload    │  │   Debug Tools   │  │   Version       │ │
│  │   System        │  │   & Profiler    │  │   Control       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Production Environment
```
┌─────────────────────────────────────────────────────────────┐
│                  PRODUCTION ENVIRONMENT                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Dome          │  │   Content       │  │   Monitoring    │ │
│  │   Hardware      │  │   Delivery      │  │   & Analytics   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Backup &      │  │   Security      │  │   Performance   │ │
│  │   Recovery      │  │   System        │  │   Optimization  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Security Architecture

### Security Layers
1. **Content Security**: Image and data integrity validation
2. **Network Security**: Encrypted communication channels
3. **Application Security**: Input validation and sanitization
4. **System Security**: Hardware and OS-level protection

### Security Measures
```typescript
interface SecurityConfiguration {
  contentValidation: boolean;          // Validate all loaded content
  encryptedStorage: boolean;           // Encrypt cached data
  accessControl: AccessControlPolicy; // User permission system
  auditLogging: boolean;               // Track all user actions
  networkEncryption: EncryptionType;   // Secure data transmission
}
```

## Scalability Architecture

### Horizontal Scaling
- **Multi-dome Support**: Single application serving multiple domes
- **Content Distribution**: CDN integration for global deployment
- **Load Balancing**: Distribute processing across multiple systems

### Vertical Scaling
- **GPU Acceleration**: Utilize high-end graphics hardware
- **Memory Optimization**: Efficient caching and garbage collection
- **CPU Optimization**: Multi-threaded processing for complex operations

## Monitoring & Analytics

### System Monitoring
```typescript
interface SystemMetrics {
  performance: {
    frameRate: number;
    memoryUsage: number;
    cpuUtilization: number;
    gpuUtilization: number;
  };
  
  user: {
    sessionDuration: number;
    projectsViewed: number;
    interactionCount: number;
    navigationPatterns: NavigationPattern[];
  };
  
  system: {
    errorRate: number;
    responseTime: number;
    availability: number;
    resourceUtilization: ResourceMetrics;
  };
}
```

### Analytics Dashboard
- **Real-time Performance**: Live system metrics
- **User Behavior**: Interaction patterns and preferences
- **Content Analytics**: Most viewed projects and features
- **System Health**: Uptime, errors, and performance trends

## Future Architecture Considerations

### Phase 3: Advanced Features
- **Multi-user Collaboration**: Synchronized dome experiences
- **Voice Control**: Natural language navigation
- **AI Integration**: Intelligent project recommendations
- **AR/VR Support**: Mixed reality extensions

### Phase 4: Platform Evolution
- **Cloud Integration**: Hybrid cloud-local architecture
- **API Ecosystem**: Third-party integrations
- **Mobile Companion**: Tablet/phone control interfaces
- **Analytics Platform**: Advanced business intelligence

## Technical Specifications

### Minimum System Requirements
- **OS**: Windows 10/11, macOS 10.15+, Linux Ubuntu 18.04+
- **CPU**: Intel i7-8700K / AMD Ryzen 7 2700X or equivalent
- **GPU**: NVIDIA GTX 1070 / AMD RX 580 or equivalent
- **RAM**: 16GB DDR4
- **Storage**: 1TB SSD (for image caching)
- **Network**: 100 Mbps for content streaming

### Recommended System Specifications
- **CPU**: Intel i9-12900K / AMD Ryzen 9 5900X or equivalent
- **GPU**: NVIDIA RTX 3080 / AMD RX 6800 XT or equivalent
- **RAM**: 32GB DDR4
- **Storage**: 2TB NVMe SSD
- **Network**: 1 Gbps for optimal performance

## Conclusion

This architecture provides a robust, scalable foundation for the dome projection system while maintaining flexibility for future enhancements. The modular design allows for independent development and testing of each layer, while the standardized interfaces ensure seamless integration between components.

The use of 2D images as equirectangular placeholders provides an immediate path to deployment while establishing the infrastructure for future 360° content integration. This approach balances technical feasibility with long-term vision, creating a system that can evolve with advancing technology and user needs. 