import React, { useRef, useState } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

interface UploadGeoJSONControlProps {
  onUpload: (data: any, fileType: string, fileName: string) => void
}

const UploadGeoJSONControl: React.FC<UploadGeoJSONControlProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const map = useMap()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  React.useEffect(() => {
    const UploadControl = L.Control.extend({
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
        const button = L.DomUtil.create('a', 'leaflet-control-upload', container)
        button.href = '#'
        button.title = 'העלה GeoJSON או TIF'
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>'
        
        L.DomEvent.on(button, 'click', function(e) {
          L.DomEvent.stopPropagation(e)
          L.DomEvent.preventDefault(e)
          if (!isUploading) {
            fileInputRef.current?.click()
          }
        })

        return container
      }
    })

    const uploadControl = new UploadControl({ position: 'topright' })
    map.addControl(uploadControl)

    return () => {
      map.removeControl(uploadControl)
    }
  }, [map, isUploading])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      setUploadProgress(0)
      const fileType = file.name.split('.').pop()?.toLowerCase()
      
      try {
        if (fileType === 'geojson' || fileType === 'json') {
          const text = await file.text()
          const geoJSON = JSON.parse(text)
          onUpload(geoJSON, 'geojson', file.name)
        } else if (fileType === 'tif' || fileType === 'tiff') {
          const reader = new FileReader()
          reader.onload = (event) => {
            if (event.target?.result) {
              onUpload(event.target.result, 'tif', file.name)
            }
          }
          reader.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = (event.loaded / event.total) * 100
              setUploadProgress(progress)
            }
          }
          reader.readAsArrayBuffer(file)
        } else {
          throw new Error('סוג קובץ לא נתמך. אנא העלה קובץ GeoJSON או TIF.')
        }
      } catch (error) {
        console.error('שגיאה בהעלאת הקובץ:', error)
        alert(error instanceof Error ? error.message : 'שגיאה בהעלאת הקובץ. אנא נסה שוב.')
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept=".geojson,.json,.tif,.tiff"
        className="hidden"
        disabled={isUploading}
      />
      {isUploading && (
        <div className="absolute top-0 left-0 right-0 z-[1000] bg-blue-500 h-1">
          <div 
            className="h-full bg-blue-300" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
    </>
  )
}

export default UploadGeoJSONControl