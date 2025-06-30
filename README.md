# OmniVapor

**Interactive 360° Architectural Portfolio with Dome Projection Capabilities**

A comprehensive React-based mapping application showcasing Pfluger Architects' portfolio with immersive 360° viewing capabilities, built on the OmniMap SDK foundation.

## 🌐 Live Demo

**https://addnomis.github.io/OmniVapor/**

## ✨ Features

### Interactive Map
- **Texas-focused architectural project visualization** with 61 projects
- **Market-based filtering** (PreK-12, Higher Education, CTE & STEM, etc.)
- **Real-time statistics** and project analytics
- **Responsive design** with modern dark theme

### 360° Immersive Viewing
- **True 3D spherical projection** using Three.js WebGL
- **Natural camera controls** without gimbal lock
- **Hardware-accelerated rendering** at 60fps
- **11 sample equirectangular images** with random assignment

### Technical Foundation
- **OmniMap SDK integration ready** for dome projection systems
- **Modern React 19** with TypeScript
- **D3.js visualization** for interactive mapping
- **Styled Components** for maintainable CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Modern web browser with WebGL support

### Development
```bash
# Clone the repository
git clone https://github.com/Addnomis/OmniVapor.git
cd OmniVapor

# Install dependencies
npm install

# Start development server
npm start
```

Visit `http://localhost:3000` to view the application.

### Production Build
```bash
# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 📁 Project Structure

```
OmniVapor/
├── public/                 # Static assets and 360° images
│   ├── images/360_Images/ # Sample equirectangular images
│   └── final_pfluger_projects.json
├── src/
│   ├── components/        # React components
│   │   ├── TexasMap.tsx   # Main map with sidebar UI
│   │   ├── Simple360Viewer.tsx # Three.js 360° viewer
│   │   └── ProjectDetailPanel.tsx # Project details
│   ├── types/            # TypeScript definitions
│   └── utils/            # Utility functions
├── Sdk/                  # OmniMap SDK (C++)
├── SourceCode/           # OmniMap source implementation
├── Examples/             # DirectX/OpenGL examples
└── deploy.sh            # Deployment script
```

## 🎯 Core Components

### TexasMap.tsx
- Interactive D3.js map with project markers
- Left sidebar with filters, statistics, and legend
- Market-based color coding and size scaling

### Simple360Viewer.tsx
- Three.js WebGL spherical projection
- Equirectangular texture mapping
- Mouse/keyboard controls with natural movement

### ProjectDetailPanel.tsx
- Right sidebar with project information
- 360° viewing integration
- Responsive design

## 🔧 Technical Stack

### Frontend
- **React 19** with TypeScript
- **Three.js** for 3D rendering
- **D3.js** for data visualization
- **Styled Components** for styling
- **React Leaflet** for mapping

### Graphics Foundation
- **OmniMap SDK** (C++) for dome projection
- **DirectX 9/10/11** and **OpenGL** support
- **GLEW**, **Lua scripting**, **SpoutSDK**

### Deployment
- **GitHub Pages** with automatic CI/CD
- **GitHub Actions** for build and deploy
- **Optimized production builds**

## 📊 Project Data

The application showcases **61 architectural projects** across Texas and Louisiana:
- **PreK-12 Education**: 37 projects
- **Higher Education**: 18 projects  
- **CTE & STEM**: 2 projects
- **Athletics, Fine Arts, Other**: 4 projects

Each project includes:
- Geographic coordinates
- Market classification
- Project details (size, cost, year)
- 360° architectural imagery

## 🌐 Deployment

### Automatic Deployment
Every push to `main` branch triggers automatic deployment via GitHub Actions.

### Manual Deployment
```bash
./deploy.sh
```

### GitHub Pages Configuration
- Repository: https://github.com/Addnomis/OmniVapor
- Branch: `gh-pages`
- URL: https://addnomis.github.io/OmniVapor/

## 🎮 Usage

1. **Explore the Map**: Click and drag to navigate the Texas map
2. **Filter Projects**: Use the left sidebar to filter by market type
3. **View Details**: Click any project marker to see details in the right sidebar
4. **Experience 360°**: Click "Experience in 360°" for immersive viewing
5. **Navigate 360°**: Drag to look around, scroll to zoom, ESC to exit

## 🔮 OmniMap Integration

The project is architected for seamless integration with dome projection systems:
- **Sphere geometry algorithms** match OmniMap's implementation
- **Equirectangular mapping** compatible with dome warping
- **Modular architecture** for easy OmniMap bridge integration

## 📈 Performance

- **255KB gzipped bundle** with Three.js included
- **60fps WebGL rendering** with hardware acceleration
- **Optimized image loading** with progress tracking
- **Responsive design** for all screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project combines multiple components with different licenses:
- **React Application**: MIT License
- **OmniMap SDK**: See `Sdk/Documentation/license.rtf`
- **SpoutSDK**: See `SourceCode/Dependencies/SpoutSDK/licence.txt`
- **GLEW**: See `SourceCode/Dependencies/Glew-1.9.0/LICENSE.txt`

## 🆘 Support

- **Live Demo**: https://addnomis.github.io/OmniVapor/
- **Documentation**: See `DEPLOYMENT.md` for deployment guide
- **Issues**: GitHub Issues for bug reports and feature requests

---

**Built with ❤️ for immersive architectural visualization** 