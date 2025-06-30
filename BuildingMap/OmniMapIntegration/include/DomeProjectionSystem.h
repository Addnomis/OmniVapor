#pragma once

#include <string>
#include <vector>
#include <memory>
#include <functional>
#include <map>

// Forward declarations
class OmniMapBase;
class WebViewChannel;
class DomeInteractionHandler;
class EquirectangularRenderer;

namespace DomeProjection {

    // Coordinate system for dome projection
    struct DomeCoordinates {
        double azimuth;   // Horizontal angle (0-360°)
        double elevation; // Vertical angle (-90° to 90°)
        double distance;  // Distance from dome center (0-1)
    };

    // Equirectangular image metadata
    struct EquirectangularMetadata {
        int width;
        int height;
        double fieldOfView;
        std::string projection; // "equirectangular", "cylindrical", "spherical"
        bool optimizedForDome;
    };

    // Dome projection settings
    struct DomeProjectionSettings {
        double domeRadius;
        int projectorCount;
        double blendOverlap;
        
        struct FisheyeSettings {
            bool enabled;
            double strength;
            double centerX;
            double centerY;
        } fisheye;
        
        std::vector<struct DomeChannel> channels;
    };

    // Individual dome channel configuration
    struct DomeChannel {
        std::string id;
        std::string name;
        DomeCoordinates position;
        
        struct Resolution {
            int width;
            int height;
        } resolution;
        
        struct BlendRegion {
            double left, right, top, bottom;
        } blendRegion;
    };

    // Interaction event from dome
    struct DomeInteractionEvent {
        enum Type { GAZE, GESTURE, VOICE, CONTROLLER } type;
        DomeCoordinates position;
        std::string data;
        long long timestamp;
    };

    // Navigation state
    struct DomeNavigationState {
        std::string currentProject;
        enum ViewMode { MAP, PROJECT, TOUR, PRESENTATION } viewMode;
        bool isImmersive;
        std::string selectedRegion;
        double zoomLevel;
    };

    // Main dome projection system class
    class DomeProjectionSystem {
    public:
        DomeProjectionSystem();
        ~DomeProjectionSystem();

        // Initialization and cleanup
        bool Initialize(const DomeProjectionSettings& settings);
        void Shutdown();
        bool IsInitialized() const { return m_initialized; }

        // Web view integration
        bool SetupWebView(const std::string& htmlPath, int width, int height);
        bool LoadReactApp(const std::string& appUrl);
        void UpdateWebView();

        // Dome projection control
        bool SetProjectionSettings(const DomeProjectionSettings& settings);
        bool UpdateView(const DomeCoordinates& coordinates);
        bool RenderEquirectangular(const std::string& imageUrl, const EquirectangularMetadata& metadata);

        // Interaction handling
        bool EnableInteraction(bool enabled);
        bool CalibrateInput();
        void SetInteractionCallback(std::function<void(const DomeInteractionEvent&)> callback);

        // Navigation
        bool NavigateToProject(const std::string& projectId);
        bool SetViewMode(DomeNavigationState::ViewMode mode);
        bool EnterImmersiveMode(const std::string& projectId);
        bool ExitImmersiveMode();

        // Communication with React app
        bool SendCommandToReact(const std::string& command, const std::string& data);
        void SetReactEventCallback(std::function<void(const std::string&, const std::string&)> callback);

        // Coordinate conversion utilities
        DomeCoordinates GeographicToDome(double lat, double lng) const;
        std::pair<double, double> DomeToGeographic(const DomeCoordinates& coords) const;

        // Getters
        const DomeNavigationState& GetNavigationState() const { return m_navigationState; }
        const DomeProjectionSettings& GetProjectionSettings() const { return m_projectionSettings; }

    private:
        bool m_initialized;
        DomeProjectionSettings m_projectionSettings;
        DomeNavigationState m_navigationState;

        // Core components
        std::unique_ptr<OmniMapBase> m_omniMap;
        std::unique_ptr<WebViewChannel> m_webView;
        std::unique_ptr<DomeInteractionHandler> m_interactionHandler;
        std::unique_ptr<EquirectangularRenderer> m_equirectangularRenderer;

        // Callbacks
        std::function<void(const DomeInteractionEvent&)> m_interactionCallback;
        std::function<void(const std::string&, const std::string&)> m_reactEventCallback;

        // Internal methods
        bool InitializeOmniMap();
        bool InitializeWebView();
        bool InitializeInteractionHandler();
        bool InitializeEquirectangularRenderer();

        void HandleOmniMapEvent(const std::string& eventType, const std::string& data);
        void HandleWebViewEvent(const std::string& eventType, const std::string& data);
        void HandleInteractionEvent(const DomeInteractionEvent& event);

        // Rendering pipeline
        void UpdateRenderPipeline();
        void RenderFrame();
        void BlendChannels();
    };

    // Utility functions
    std::string DomeCoordinatesToJson(const DomeCoordinates& coords);
    DomeCoordinates DomeCoordinatesFromJson(const std::string& json);
    std::string EquirectangularMetadataToJson(const EquirectangularMetadata& metadata);
    EquirectangularMetadata EquirectangularMetadataFromJson(const std::string& json);

    // Error handling
    enum class DomeError {
        NONE,
        INITIALIZATION_FAILED,
        OMNIMAP_ERROR,
        WEBVIEW_ERROR,
        INTERACTION_ERROR,
        RENDERING_ERROR,
        INVALID_COORDINATES,
        INVALID_METADATA
    };

    std::string GetErrorString(DomeError error);

} // namespace DomeProjection 