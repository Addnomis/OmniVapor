# OmniVapor

A comprehensive graphics and mapping toolkit featuring the OmniMap SDK, building mapping tools, and various rendering examples.

## Project Structure

### Core Components

- **OmniMap SDK** (`Sdk/`) - Complete SDK with libraries, documentation, and resources
- **Source Code** (`SourceCode/`) - Full source implementation with dependencies
- **Examples** (`Examples/`) - Demonstration applications and samples
- **Building Map** (`BuildingMap/`) - Interactive mapping application for architectural projects

## Features

### OmniMap SDK
- Cross-platform graphics rendering (DirectX 9/10/11, OpenGL)
- Dome and projection mapping capabilities
- Comprehensive documentation and examples
- Multiple Visual Studio project configurations

### Building Map Application
- Interactive React-based mapping interface
- Texas-focused architectural project visualization
- Real-time project data scraping and processing
- Responsive design with modern UI components

### Examples & Demos
- DirectX 10/11 HLSL examples
- OpenGL rendering samples
- Multi-animation systems
- Dome-enabled applications

## Quick Start

### Prerequisites
- Visual Studio 2008/2013/2019+ (for C++ components)
- Node.js and npm (for React components)
- Python 3.x (for data processing tools)

### Building the SDK
1. Open `SourceCode/Projects/Win/VS2013/OmniMap.sln`
2. Build the solution for your target platform (32-bit/64-bit)
3. Libraries will be generated in `Sdk/lib/`

### Running the Building Map
```bash
cd BuildingMap/pfluger-map
npm install
npm start
```

### Running Examples
Navigate to any example directory and open the solution file:
```bash
cd Examples/Direct3D/Direct3D10/BasicHLSL10
# Open BasicHLSL10_2003.sln in Visual Studio
```

## Documentation

- **SDK Documentation**: `Sdk/Documentation/`
- **API Reference**: `Sdk/Documentation/ClassDocs/html/`
- **Application Architecture**: `BuildingMap/docs/APPLICATION_ARCHITECTURE.md`
- **Development Guidelines**: `BuildingMap/docs/DEVELOPMENT_GUIDELINES.md`

## Dependencies

### C++ Components
- DirectX SDK (June 2010 or later)
- OpenGL libraries
- GLEW 1.9.0 (included)
- Lua scripting engine (included)
- Various graphics utilities (included)

### React Application
- React 18+
- TypeScript
- Modern web browser with SVG support

### Python Tools
- Python 3.x
- Required packages listed in `BuildingMap/requirements.txt`

## License

Please refer to individual component licenses:
- OmniMap SDK: See `Sdk/Documentation/license.rtf`
- SpoutSDK: See `SourceCode/Dependencies/SpoutSDK/licence.txt`
- GLEW: See `SourceCode/Dependencies/Glew-1.9.0/LICENSE.txt`

## Contributing

This project contains multiple components with different technologies:
1. Follow the development guidelines in `BuildingMap/docs/DEVELOPMENT_GUIDELINES.md`
2. Ensure all builds pass before submitting changes
3. Test across different platforms when possible

## Support

For technical support and questions:
- Check the documentation in `Sdk/Documentation/`
- Review example implementations in `Examples/`
- Consult the application architecture documentation

---

**Note**: This project combines legacy graphics SDK components with modern web technologies. Some components may require specific versions of development tools or dependencies. 