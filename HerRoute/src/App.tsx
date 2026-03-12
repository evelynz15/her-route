import { useState, useRef } from 'react';
import { Header } from './components/Header';
import { MapSection } from './components/MapSection';
import { Sidebar } from './components/Sidebar';
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";



export default function App() {
  const [nightMode, setNightMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarView, setSidebarView] = useState<'overview' | 'segment'>('overview');
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [routeGenerated, setRouteGenerated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const resetMapViewRef = useRef<(() => void) | null>(null);

  const handleDestinationSelect = async (destination: string) => {
    const response = await fetch(
    "http://127.0.0.1:5001/her-route/us-central1/getRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        origin: "Waterloo Park, Waterloo, ON, Canada",
        destination: "University of Waterloo, Waterloo, ON, Canada",
      }),
    }
  );

    const data = await response.json();
    console.log("Best route:", data);

    setRouteGenerated(true);
    setSidebarView('overview');
    setSidebarCollapsed(false);
  };

  const handleClearRoute = () => {
    setRouteGenerated(false);
    setSidebarView('overview');
    setSelectedSegment(null);
    setSidebarCollapsed(false);
  };

  const handleBackToOverview = () => {
    setSidebarView('overview');
    if (resetMapViewRef.current) {
      resetMapViewRef.current();
    }
  };

  return (
    <div className={`h-screen flex flex-col ${nightMode ? 'bg-gray-900' : 'bg-white'}`}>
      <Header 
        nightMode={nightMode} 
        onToggleNightMode={() => setNightMode(!nightMode)}
        onSettings={() => setShowSettings(!showSettings)}
      />
      
      <div className="flex-1 flex overflow-hidden relative">
        <MapSection 
          nightMode={nightMode}
          routeGenerated={routeGenerated}
          onDestinationSelect={handleDestinationSelect}
          onClearRoute={handleClearRoute}
          onNodeClick={(nodeId) => {
            setSelectedSegment(nodeId);
            setSidebarView('segment');
            setSidebarCollapsed(false);
          }}
          onResetView={(resetFn) => {
            return resetMapViewRef.current = resetFn;
          }}
        />
        
        {routeGenerated && (
          <Sidebar 
            nightMode={nightMode}
            view={sidebarView}
            selectedSegment={selectedSegment}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            onBackToOverview={handleBackToOverview}
          />
        )}
      </div>
    </div>
  );
}