import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, Popup, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'

// Fix Leaflet marker icons
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function App() {
  const [roads, setRoads] = useState([])
  const [stats, setStats] = useState({ safe: 0, moderate: 0, unsafe: 0 })
  const [loading, setLoading] = useState(true)

  const macPosition = [43.2609, -79.9192]

  useEffect(() => {
    fetch('/roads_simplified.json')
      .then(res => res.json())
      .then(data => {
        console.log(`Loaded ${data.length} roads`)
        
        const roadsWithScores = data.map(road => {
          let baseScore
          if (road.type === 'primary' || road.type === 'secondary') {
            baseScore = 60 + Math.random() * 30
          } else if (road.type === 'footway' || road.type === 'path') {
            baseScore = 30 + Math.random() * 40
          } else {
            baseScore = 40 + Math.random() * 40
          }
          
          return { ...road, safetyScore: Math.floor(baseScore) }
        })

        const safe = roadsWithScores.filter(r => r.safetyScore >= 70).length
        const moderate = roadsWithScores.filter(r => r.safetyScore >= 40 && r.safetyScore < 70).length
        const unsafe = roadsWithScores.filter(r => r.safetyScore < 40).length

        setRoads(roadsWithScores)
        setStats({ safe, moderate, unsafe })
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading roads:', err)
        setLoading(false)
      })
  }, [])

  const getSafetyColor = (score) => {
    if (score >= 70) return '#10b981'
    if (score >= 40) return '#f59e0b'
    return '#ef4444'
  }

  const getWeight = (type) => {
    if (type === 'primary' || type === 'secondary') return 5
    if (type === 'footway' || type === 'path') return 2
    return 3
  }

  return (
    <div className="app">
      <div className="info-panel">
        <h2>HerRoute</h2>
        <p>McMaster Safety Map</p>
        {loading ? (
          <div className="stats">Loading...</div>
        ) : (
          <div className="stats">
            <strong>{roads.length}</strong> segments
            <div className="stats-breakdown">
              <div><span className="dot safe"></span> {stats.safe} safe</div>
              <div><span className="dot moderate"></span> {stats.moderate} moderate</div>
              <div><span className="dot unsafe"></span> {stats.unsafe} unsafe</div>
            </div>
          </div>
        )}
      </div>

      <div className="legend">
        <strong>Safety Level</strong>
        <div className="legend-item">
          <div className="legend-color safe"></div>
          <span>Safe (70-100)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color moderate"></div>
          <span>Moderate (40-69)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color unsafe"></div>
          <span>Unsafe (0-39)</span>
        </div>
      </div>

      <MapContainer 
        center={macPosition} 
        zoom={14} 
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <Marker position={macPosition}>
          <Popup><strong>McMaster University</strong></Popup>
        </Marker>

        {roads.map((road, idx) => (
          <Polyline
            key={idx}
            positions={road.coordinates}
            pathOptions={{
              color: getSafetyColor(road.safetyScore),
              weight: getWeight(road.type),
              opacity: 0.7
            }}
          >
            <Popup>
              <div>
                <strong>{road.name}</strong><br />
                <small>{road.type}</small><br />
                <strong>Safety: {road.safetyScore}/100</strong>
              </div>
            </Popup>
          </Polyline>
        ))}
      </MapContainer>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-box">Loading map...</div>
        </div>
      )}
    </div>
  )
}

export default App