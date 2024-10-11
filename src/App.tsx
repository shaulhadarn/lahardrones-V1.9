import React, { useState, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, FeatureGroup, GeoJSON, Marker, Popup, LayersControl } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import * as turf from '@turf/turf'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import InfoModal from './components/InfoModal'
import UploadGeoJSONControl from './components/UploadGeoJSONControl'
import SearchControl from './components/SearchControl'
import noFlyZonesData from './data/noFlyZones.json'
import parseGeoraster from 'georaster'
import GeoRasterLayer from 'georaster-layer-for-leaflet'

function App() {
  const [showModal, setShowModal] = useState(false)
  const [polygonInfo, setPolygonInfo] = useState<any>(null)
  const [geoJSONLayers, setGeoJSONLayers] = useState<Record<string, L.GeoJSON>>({})
  const [tifLayers, setTifLayers] = useState<Record<string, any>>({})
  const [searchResult, setSearchResult] = useState<{ coords: [number, number]; name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const mapRef = useRef<L.Map | null>(null)

  const handleCreated = useCallback((e: any) => {
    const { layer } = e
    const geoJSON = layer.toGeoJSON()
    const area = turf.area(geoJSON)
    const perimeter = turf.length(geoJSON)
    const coordinates = geoJSON.geometry.coordinates[0]

    const intersectingZones = noFlyZonesData.features.filter(zone => 
      turf.booleanIntersects(geoJSON, zone)
    ).map(zone => zone.properties.name)

    setPolygonInfo({
      coordinates,
      area: area.toFixed(2),
      perimeter: perimeter.toFixed(2),
      noFlyZones: intersectingZones,
    })
    setShowModal(true)

    // Add the new layer to geoJSONLayers
    const layerId = `drawn-layer-${Date.now()}`
    setGeoJSONLayers(prev => ({ ...prev, [layerId]: layer }))
  }, [])

  const handleSearch = useCallback((result: [number, number], name: string) => {
    setSearchResult({ coords: result, name })
    mapRef.current?.setView(result, 13)
  }, [])

  const handleFileUpload = useCallback(async (data: any, fileType: string, fileName: string) => {
    setIsLoading(true)
    try {
      if (fileType === 'geojson') {
        const newLayer = L.geoJSON(data, {
          style: () => ({ color: 'blue', weight: 2, fillOpacity: 0.2 })
        })
        setGeoJSONLayers(prev => ({ ...prev, [fileName]: newLayer }))
        newLayer.addTo(mapRef.current!)
        mapRef.current?.fitBounds(newLayer.getBounds())
      } else if (fileType === 'tif') {
        const arrayBuffer = await data.arrayBuffer()
        const georaster = await parseGeoraster(arrayBuffer)
        
        const newLayer = new GeoRasterLayer({
          georaster: georaster,
          opacity: 0.7,
          resolution: 256
        })
        
        setTifLayers(prev => ({ ...prev, [fileName]: newLayer }))
        newLayer.addTo(mapRef.current!)
        mapRef.current?.fitBounds(newLayer.getBounds())
      }
    } catch (error) {
      console.error('Error processing file:', error)
      alert('שגיאה בעיבוד הקובץ. אנא ודא שזהו קובץ תקין ונסה שוב.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 bg-blue-800 bg-opacity-90 text-white">
        <h1 className="text-2xl font-bold">Lahar שירותי מיפוי מתקדמים</h1>
      </div>
      <div className="flex-grow relative">
        <MapContainer
          center={[31.7683, 35.2137]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            maxZoom={20}
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          />
          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={handleCreated}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
              }}
            />
          </FeatureGroup>
          <GeoJSON data={noFlyZonesData as any} style={() => ({ color: 'red', fillOpacity: 0.2 })} />
          <LayersControl position="topright">
            {Object.entries(geoJSONLayers).map(([name, layer]) => (
              <LayersControl.Overlay checked name={name} key={name}>
                <GeoJSON data={layer.toGeoJSON()} />
              </LayersControl.Overlay>
            ))}
            {Object.entries(tifLayers).map(([name, layer]) => (
              <LayersControl.Overlay checked name={name} key={name}>
                {layer}
              </LayersControl.Overlay>
            ))}
          </LayersControl>
          {searchResult && (
            <Marker position={searchResult.coords}>
              <Popup>{searchResult.name}</Popup>
            </Marker>
          )}
          <UploadGeoJSONControl onUpload={handleFileUpload} />
          <SearchControl onSearchResult={handleSearch} />
        </MapContainer>
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 z-[1000] bg-blue-500 h-1">
            <div className="h-full w-full bg-blue-300 animate-pulse"></div>
          </div>
        )}
      </div>
      {showModal && polygonInfo && (
        <InfoModal
          info={polygonInfo}
          onClose={() => setShowModal(false)}
          onSend={() => {
            console.log('שולח לחברת הרחפנים:', polygonInfo)
            alert('נשלח לחברת הרחפנים')
          }}
        />
      )}
    </div>
  )
}

export default App