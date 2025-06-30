# Pfluger Architects Portfolio Map - Project Design Record (PDR)

## Project Overview
**Project Name**: Pfluger Architects Portfolio Map & Dome Projection System  
**Date Started**: June 2025  
**Status**: Phase 1 Complete - Transitioning to Dome Integration  
**Repository**: https://github.com/Addnomis/BuildingMap  

## Project Description
An innovative architectural visualization system that combines interactive web mapping with immersive dome projection. The project integrates Pfluger Architects' portfolio of 61 architectural projects with OmniMap dome projection technology to create an unprecedented architectural presentation platform.

## Architecture Overview

### Phase 1: Web-Based Portfolio Map ✅ COMPLETE
- **Target Website**: https://pflugerarchitects.com/portfolio/
- **Data Extracted**: 61 architectural projects with metadata
- **Images Downloaded**: Project photos organized by market categories
- **React Application**: Interactive map with D3.js visualization
- **Deployment**: GitHub Pages ready

### Phase 2: Dome Integration Architecture 🔄 IN PROGRESS
- **OmniMap Integration**: C++ bridge between React app and dome projection
- **360° Image Pipeline**: Equirectangular projection system
- **Dome-Optimized UI**: Curved interface design for fisheye projection
- **Multi-Channel Rendering**: Seamless dome display across projection channels

### Phase 3: Immersive Experience Platform 📋 PLANNED
- **Interactive Navigation**: Dome-based spatial interaction
- **360° Virtual Tours**: Equirectangular image viewing in dome
- **Client Presentation Mode**: Guided architectural tours
- **Multi-User Collaboration**: Synchronized dome experiences

## System Architecture

### Core Components

#### 1. Web Application Layer (React + D3.js)
```
pfluger-map/
├── src/
│   ├── components/
│   │   ├── TexasMap.tsx              # Geographic visualization
│   │   ├── ProjectTooltip.tsx        # Interactive project details
│   │   └── EquirectangularViewer.tsx # 360° image placeholder viewer
│   │   └── DomeProjection.ts         # Dome-specific interfaces
│   ├── types/
│   │   ├── Project.ts                # Enhanced with 360° metadata
│   │   └── DomeProjection.ts         # Dome-specific interfaces
│   └── services/
│       ├── ProjectDataService.ts     # Data management
│       └── DomeIntegrationService.ts # OmniMap communication
```

#### 2. OmniMap Integration Layer (C++)
```
OmniMapDome/
├── src/
│   ├── WebViewChannel.cpp           # Embedded React app
│   ├── DomeInteractionHandler.cpp   # Gesture/input mapping
│   ├── EquirectangularRenderer.cpp  # 360° image projection
│   └── ProjectNavigationSystem.cpp  # Spatial navigation
```

#### 3. Content Pipeline
```
ContentPipeline/
├── scrapers/                        # Web scraping (existing)
├── image_processors/
│   ├── equirectangular_converter.py # 2D to 360° placeholder
│   └── dome_optimizer.py           # Fisheye lens optimization
└── metadata_enhancers/
    └── spatial_indexer.py          # Geographic clustering
```

## Technology Stack

### Frontend (Enhanced)
- **React 19** with TypeScript
- **D3.js v7** for data visualization
- **Leaflet** for 2D mapping
- **Three.js** for 360° image rendering (placeholder)
- **Styled Components** for dome-optimized UI

### Backend Integration
- **OmniMap SDK** (C++) for dome projection
- **Chromium Embedded Framework (CEF)** for web integration
- **OpenGL** for 360° rendering pipeline
- **Lua Scripting** for dome configuration

### Content Management
- **Equirectangular Image Format** (.jpg, .png)
- **Spatial Metadata** (JSON with dome coordinates)
- **Progressive Loading** for high-resolution content

## Development Phases

### ✅ Phase 1: Foundation (COMPLETE)
- [x] Web scraping pipeline
- [x] React application with interactive map
- [x] D3.js data visualization
- [x] GitHub Pages deployment
- [x] 61 architectural projects indexed

### 🔄 Phase 2: Dome Integration (IN PROGRESS)
- [ ] OmniMap C++ integration layer
- [ ] Equirectangular image viewer component
- [ ] Dome-optimized UI design
- [ ] Fisheye lens calibration
- [ ] Multi-channel rendering setup

### 📋 Phase 3: Immersive Features (PLANNED)
- [ ] 360° virtual tour system
- [ ] Spatial navigation in dome
- [ ] Voice command integration
- [ ] Multi-user synchronization
- [ ] Client presentation templates

### 📋 Phase 4: Advanced Features (FUTURE)
- [ ] Real-time collaboration
- [ ] AR/VR integration
- [ ] AI-powered project recommendations
- [ ] Analytics and usage tracking

## Current Status: Phase 2 Development

### ✅ Recently Completed
1. **Architecture Planning**: High-level system design
2. **Technology Selection**: React + OmniMap integration strategy
3. **Data Model Enhancement**: 360° image metadata structure
4. **Development Guidelines**: Updated project roadmap

### 🔄 Active Development
1. **Equirectangular Viewer**: React component for 360° placeholder images
2. **OmniMap Integration**: C++ bridge development
3. **Dome UI Design**: Curved interface patterns
4. **Content Pipeline**: 2D to 360° placeholder conversion

### 📋 Next Milestones
1. **Working Dome Prototype**: Basic React app in dome projection
2. **360° Image Integration**: Equirectangular viewing system
3. **Spatial Navigation**: Dome-based interaction model
4. **Client Demo**: First architectural presentation in dome

## File Structure (Updated)

```
BuildingMap/
├── pfluger-map/                     # React Web Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── TexasMap.tsx
│   │   │   ├── ProjectTooltip.tsx
│   │   │   └── EquirectangularViewer.tsx  # NEW: 360° viewer
│   │   ├── types/
│   │   │   ├── Project.ts           # Enhanced with 360° metadata
│   │   │   └── DomeProjection.ts    # NEW: Dome interfaces
│   │   └── services/
│   │       └── DomeIntegrationService.ts  # NEW: OmniMap bridge
│   └── public/
│       ├── final_pfluger_projects.json
│       └── images/                  # 2D images as 360° placeholders
├── OmniMapIntegration/              # NEW: C++ Integration Layer
│   ├── src/
│   │   ├── WebViewChannel.cpp
│   │   ├── DomeInteractionHandler.cpp
│   │   └── EquirectangularRenderer.cpp
│   └── include/
│       └── DomeProjectionSystem.h
├── ContentPipeline/                 # Enhanced Processing
│   ├── equirectangular_converter.py # NEW: 2D to 360° placeholders
│   └── dome_optimizer.py           # NEW: Fisheye optimization
├── docs/
│   ├── PROJECT_DESIGN_RECORD.md    # This document
│   ├── APPLICATION_ARCHITECTURE.md # NEW: Technical architecture
│   └── DEVELOPMENT_GUIDELINES.md   # NEW: Development standards
└── [existing files...]
```

## Key Technical Decisions

### 1. Equirectangular Projection Strategy
- **Use 2D images as placeholders** for 360° content
- **Maintain aspect ratios** suitable for dome projection
- **Progressive enhancement** path to true 360° images

### 2. OmniMap Integration Approach
- **Embedded web view** using Chromium Embedded Framework
- **Bidirectional communication** between React and C++
- **Preserve existing React functionality** while adding dome features

### 3. Content Management
- **Backward compatible** data structure
- **Flexible metadata** system for future enhancements
- **Scalable architecture** for additional projects

## Development Guidelines

### Code Standards
- **TypeScript** for all new React components
- **Modern C++17** for OmniMap integration
- **Consistent naming** conventions across languages
- **Comprehensive documentation** for all public APIs

### Testing Strategy
- **Unit tests** for React components
- **Integration tests** for OmniMap bridge
- **Visual regression tests** for dome projection
- **Performance benchmarks** for 360° rendering

### Deployment Pipeline
- **Automated builds** for React application
- **Cross-platform compilation** for OmniMap integration
- **Staged deployments** (development → staging → production)
- **Version management** with semantic versioning

## Risk Management

### Technical Risks
- **OmniMap integration complexity**: Mitigated by incremental development
- **Performance constraints**: Addressed through optimization pipeline
- **Cross-platform compatibility**: Handled by standardized APIs

### Content Risks
- **360° image availability**: Mitigated by placeholder system
- **Copyright and licensing**: Addressed through proper attribution
- **Data quality**: Managed through validation pipelines

## Success Metrics

### Phase 2 Goals
- [ ] React app successfully embedded in dome projection
- [ ] Smooth interaction between web UI and dome
- [ ] 360° placeholder images rendering correctly
- [ ] Client demo completed successfully

### Long-term Vision
- **Industry-leading** architectural visualization platform
- **Scalable solution** for multiple architectural firms
- **Technology showcase** demonstrating dome projection capabilities
- **Commercial viability** as a presentation service

## How to Continue Development

### Prerequisites
- **Node.js 18+** for React development
- **Visual Studio 2019+** for OmniMap integration
- **OmniMap SDK** properly installed
- **Git LFS** for large image assets

### Development Setup
```bash
# React development
cd pfluger-map
npm install
npm start

# OmniMap integration (future)
cd OmniMapIntegration
mkdir build && cd build
cmake ..
make

# Content pipeline
cd ContentPipeline
pip install -r requirements.txt
python equirectangular_converter.py
```

### Next Development Steps
1. **Create EquirectangularViewer component**
2. **Implement OmniMap C++ bridge**
3. **Design dome-optimized UI patterns**
4. **Set up development environment for dome testing**
5. **Create client presentation templates**

This updated project design record reflects our evolution from a simple web application to a comprehensive dome projection system, while maintaining the successful foundation we've built with the React application and D3.js visualization. 