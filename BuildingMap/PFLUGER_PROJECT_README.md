# Pfluger Architects Portfolio Map

An interactive React application that visualizes Pfluger Architects' portfolio of 61 architectural projects across Texas and Louisiana.

## Features

### 🗺️ **Interactive Map**
- **Leaflet-based map** centered on Texas
- **Project markers** with color-coded market categories
- **Size-based scaling** where newer projects appear larger
- **Hover tooltips** with detailed project information
- **Click popups** for additional project details

### 🎯 **Filtering & Navigation**
- **Market filter** to show specific project types
- **Real-time statistics** showing project counts and averages
- **Color-coded legend** for easy market identification

### 💼 **Project Data**
Each project includes:
- **Project name** and location
- **Year built** (2010-2025)
- **Size** in square feet (50K-500K SF)
- **Cost** estimates based on market and size
- **Market category** (PreK-12, Higher Education, CTE & STEM, etc.)
- **High-quality images** of completed projects
- **Detailed descriptions** of each facility

### 🎨 **Modern UI/UX**
- **Responsive design** that works on all devices
- **Beautiful tooltips** with project images and details
- **Smooth animations** and transitions
- **Clean, modern interface** with intuitive controls

## Market Categories

- **PreK-12** (37 projects) - Elementary, middle, and high schools
- **Higher Education** (18 projects) - Universities and colleges
- **CTE & STEM** (2 projects) - Technical and STEM facilities
- **Other** (4 projects) - Miscellaneous projects

## Technology Stack

- **React** with TypeScript
- **Leaflet** for interactive mapping
- **D3.js** for data scaling and visualization
- **Styled Components** for modern CSS-in-JS styling
- **OpenStreetMap** tiles for the base map

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser** to `http://localhost:3000`

## Data Sources

- **Project information** scraped from pflugerarchitects.com
- **Geographic coordinates** mapped to Texas cities and school districts
- **Sample data** generated for demonstration purposes (years, sizes, costs)
- **Project images** downloaded from the official portfolio

## Project Structure

```
src/
├── components/
│   ├── TexasMap.tsx          # Main map component
│   └── ProjectTooltip.tsx    # Tooltip component
├── types/
│   └── Project.ts            # TypeScript interfaces
├── App.tsx                   # Main application
└── index.css                 # Global styles

public/
├── final_pfluger_projects.json  # Project data
└── images/                      # Project images by category
```

## Features in Detail

### Interactive Map Markers
- **Color coding** by market type for instant recognition
- **Size scaling** based on year built (newer = larger dots)
- **Hover effects** with smooth tooltip animations
- **Click interactions** for detailed popups

### Filtering System
- **Market dropdown** to filter by project type
- **Real-time updates** to statistics and map display
- **Smooth transitions** when switching filters

### Statistics Panel
- **Live calculations** of filtered project metrics
- **Average cost** and size information
- **Project count** for current filter

### Responsive Design
- **Mobile-friendly** interface that adapts to screen size
- **Touch-optimized** interactions for mobile devices
- **Scalable UI** elements for different resolutions

This interactive map provides an engaging way to explore Pfluger Architects' diverse portfolio across Texas and Louisiana, showcasing their expertise in educational, institutional, and specialized architectural projects. 