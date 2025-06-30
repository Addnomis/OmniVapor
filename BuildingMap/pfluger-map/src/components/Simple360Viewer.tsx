import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import * as THREE from 'three';

interface Simple360ViewerProps {
  imageUrl: string;
  projectName: string;
  onBack: () => void;
}

const ViewerContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: #0f0f0f;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const LoadingContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  z-index: 10;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(178, 34, 34, 0.3);
  border-top: 4px solid #B22222;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: #e0e0e0;
  font-size: 16px;
  text-align: center;
  margin: 0;
`;

const ProgressBarContainer = styled.div`
  width: 300px;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: ${props => props.progress}%;
  height: 100%;
  background: linear-gradient(90deg, #B22222, #ff4444);
  transition: width 0.3s ease;
  border-radius: 4px;
`;

const ProgressText = styled.div`
  color: #b0b0b0;
  font-size: 14px;
  text-align: center;
  margin-top: 8px;
`;

const ErrorMessage = styled.div`
  color: #B22222;
  font-size: 18px;
  text-align: center;
  padding: 20px;
  background: rgba(26, 26, 26, 0.9);
  border-radius: 8px;
  border: 1px solid #B22222;
  max-width: 400px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
`;

const InfoOverlay = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(26, 26, 26, 0.9);
  color: #e0e0e0;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #333;
  max-width: 300px;
  z-index: 5;
`;

const ProjectName = styled.h3`
  margin: 0 0 8px 0;
  color: #B22222;
  font-size: 18px;
`;

const InfoText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #b0b0b0;
  line-height: 1.4;
`;

const DebugConsole = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: #00ff00;
  padding: 12px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  max-width: 400px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #333;
  z-index: 5;
`;

const DebugLine = styled.div`
  margin: 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ControlsOverlay = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(26, 26, 26, 0.9);
  color: #e0e0e0;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #333;
  font-size: 12px;
  z-index: 5;
`;

const Simple360Viewer: React.FC<Simple360ViewerProps> = ({ imageUrl, projectName, onBack }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const frameRef = useRef<number | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [loadStartTime, setLoadStartTime] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Mouse interaction state
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const rotationRef = useRef({ x: 0, y: 0 });

  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setDebugLogs(prev => [...prev.slice(-10), logMessage]);
    console.log('360° Viewer Debug:', logMessage);
  }, []);

  const simulateProgress = () => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return interval;
  };

  const initThreeJS = useCallback(() => {
    if (!mountRef.current) {
      addDebugLog('ERROR: mountRef.current is null');
      return;
    }

    addDebugLog('Initializing Three.js WebGL renderer');
    addDebugLog(`Container size: ${mountRef.current.clientWidth}x${mountRef.current.clientHeight}`);

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75, // FOV
      mountRef.current.clientWidth / mountRef.current.clientHeight, // Aspect ratio
      0.1, // Near plane
      1000 // Far plane
    );
    camera.position.set(0, 0, 0); // Camera at center of sphere
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x0f0f0f);
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    addDebugLog(`WebGL context: ${renderer.getContext().constructor.name}`);
    addDebugLog('Three.js scene initialized successfully');
    setIsInitialized(true);
  }, [addDebugLog]);

  const createSphere = useCallback((texture: THREE.Texture) => {
    if (!sceneRef.current) return;

    addDebugLog('Creating sphere geometry with UV mapping');

    // Create sphere geometry (similar to OmniMap's sphere creation)
    // Higher segments = smoother sphere, but more performance cost
    const geometry = new THREE.SphereGeometry(
      500, // radius
      60,  // width segments (longitude divisions)
      40   // height segments (latitude divisions)
    );

    // Flip the geometry inside-out so we see the texture from inside
    geometry.scale(-1, 1, 1);

    // Create material with the equirectangular texture
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide // Render inside faces
    });

    // Create mesh
    const sphere = new THREE.Mesh(geometry, material);
    sphereRef.current = sphere;
    sceneRef.current.add(sphere);

    addDebugLog(`Sphere created: ${geometry.attributes.position.count} vertices`);
    }, [addDebugLog]);

  const startRenderLoop = useCallback(() => {
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      if (cameraRef.current && rendererRef.current && sceneRef.current) {
        // Apply rotation based on mouse interaction
        cameraRef.current.rotation.x = rotationRef.current.x;
        cameraRef.current.rotation.y = rotationRef.current.y;
        
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();
    addDebugLog('Render loop started');
  }, [addDebugLog]);

  const loadTexture = useCallback(() => {
    addDebugLog(`Loading equirectangular texture: ${imageUrl}`);
    setLoadStartTime(Date.now());
    
    const progressInterval = simulateProgress();
    
    const loader = new THREE.TextureLoader();
    
    loader.load(
      imageUrl,
      // onLoad
      (texture: THREE.Texture) => {
        const loadTime = Date.now() - loadStartTime;
        addDebugLog(`Texture loaded successfully in ${loadTime}ms`);
        addDebugLog(`Texture size: ${texture.image.width}x${texture.image.height}`);
        
        // Configure texture for equirectangular mapping
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        
        setProgress(100);
        setTimeout(() => {
          createSphere(texture);
          setLoading(false);
          startRenderLoop();
        }, 300);
      },
      // onProgress
      (progressEvent: ProgressEvent) => {
        if (progressEvent.lengthComputable) {
          const percentComplete = (progressEvent.loaded / progressEvent.total) * 100;
          setProgress(Math.min(percentComplete, 95));
          addDebugLog(`Loading progress: ${Math.round(percentComplete)}%`);
        }
      },
      // onError
      (error: unknown) => {
        clearInterval(progressInterval);
        const loadTime = Date.now() - loadStartTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addDebugLog(`Texture load failed after ${loadTime}ms: ${errorMessage}`);
        setLoading(false);
        setError(`Failed to load 360° texture: ${imageUrl}`);
      }
    );
  }, [imageUrl, addDebugLog, loadStartTime, createSphere, startRenderLoop]);

  const handleMouseDown = (event: React.MouseEvent) => {
    mouseRef.current.isDown = true;
    mouseRef.current.x = event.clientX;
    mouseRef.current.y = event.clientY;
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!mouseRef.current.isDown) return;

    const deltaX = event.clientX - mouseRef.current.x;
    const deltaY = event.clientY - mouseRef.current.y;

    // Update rotation (inverted for natural feel)
    rotationRef.current.y -= deltaX * 0.005;
    rotationRef.current.x -= deltaY * 0.005;

    // Clamp vertical rotation
    rotationRef.current.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, rotationRef.current.x));

    mouseRef.current.x = event.clientX;
    mouseRef.current.y = event.clientY;
  };

  const handleMouseUp = () => {
    mouseRef.current.isDown = false;
  };

  const handleWheel = (event: React.WheelEvent) => {
    if (!cameraRef.current) return;
    
    // Zoom by changing FOV
    const fov = cameraRef.current.fov + event.deltaY * 0.05;
    cameraRef.current.fov = Math.max(10, Math.min(120, fov));
    cameraRef.current.updateProjectionMatrix();
  };

  const handleResize = useCallback(() => {
    if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
    
    addDebugLog(`Viewport resized: ${width}x${height}`);
  }, [addDebugLog]);

    useEffect(() => {
    initThreeJS();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Add escape key listener
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        addDebugLog('Escape key pressed - exiting 360° view');
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    // Capture mount ref for cleanup
    const currentMount = mountRef.current;
    
    return () => {
      // Cleanup
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      if (rendererRef.current && currentMount) {
        currentMount.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [initThreeJS, handleResize, onBack, addDebugLog]);

  useEffect(() => {
    if (isInitialized && imageUrl) {
      setLoading(true);
      setError(null);
      setProgress(0);
      loadTexture();
    }
  }, [imageUrl, isInitialized, loadTexture]);

  return (
    <ViewerContainer>
      <CanvasContainer
        ref={mountRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: mouseRef.current.isDown ? 'grabbing' : 'grab' }}
      />
      
      {loading && (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading 360° environment...</LoadingText>
          <ProgressBarContainer>
            <ProgressBar progress={progress} />
          </ProgressBarContainer>
          <ProgressText>{Math.round(progress)}% loaded</ProgressText>
        </LoadingContainer>
      )}
      
      {error && (
        <ErrorMessage>
          <div style={{ marginBottom: '10px' }}>❌ {error}</div>
          <div style={{ fontSize: '14px', color: '#ff6666' }}>
            Check the browser console for more details
          </div>
        </ErrorMessage>
      )}
      
      {!loading && !error && (
        <>
          <InfoOverlay>
            <ProjectName>{projectName}</ProjectName>
            <InfoText>
              🌐 360° Immersive View<br/>
              🖱️ Drag to look around<br/>
              🔍 Scroll to zoom in/out<br/>
              🎯 WebGL-powered spherical projection
            </InfoText>
          </InfoOverlay>

          <ControlsOverlay>
            <div style={{ color: '#B22222', fontWeight: 'bold', marginBottom: '4px' }}>
              Controls
            </div>
                         <div>Mouse: Look around</div>
             <div>Scroll: Zoom</div>
             <div>ESC: Exit to map</div>
          </ControlsOverlay>
        </>
      )}
      
      <DebugConsole>
        <div style={{ color: '#B22222', marginBottom: '8px', fontWeight: 'bold' }}>
          🔧 WebGL Debug Console
        </div>
        {debugLogs.map((log, index) => (
          <DebugLine key={index}>{log}</DebugLine>
        ))}
      </DebugConsole>
    </ViewerContainer>
  );
};

export default Simple360Viewer; 