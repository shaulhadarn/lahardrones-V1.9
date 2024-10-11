import React, { useState, useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { Search } from 'lucide-react'

interface SearchControlProps {
  onSearchResult: (result: [number, number], name: string) => void
}

const SearchControl: React.FC<SearchControlProps> = ({ onSearchResult }) => {
  const map = useMap()
  const [isSearching, setIsSearching] = useState(false)

  const searchLocation = async (query: string) => {
    setIsSearching(true)
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
      const data = await response.json()
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]
        onSearchResult([parseFloat(lat), parseFloat(lon)], display_name)
        map.setView([parseFloat(lat), parseFloat(lon)], 13)
      } else {
        alert('לא נמצאו תוצאות עבור החיפוש הזה.')
      }
    } catch (error) {
      console.error('Error during search:', error)
      alert('אירעה שגיאה במהלך החיפוש. אנא נסה שוב.')
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    const SearchControl = L.Control.extend({
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
        const button = L.DomUtil.create('a', 'leaflet-control-search', container)
        button.href = '#'
        button.title = 'חיפוש'
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>'
        
        L.DomEvent.on(button, 'click', function(e) {
          L.DomEvent.stopPropagation(e)
          L.DomEvent.preventDefault(e)
          if (!isSearching) {
            const query = prompt('הזן מיקום לחיפוש:')
            if (query) {
              searchLocation(query)
            }
          }
        })

        return container
      }
    })

    const searchControl = new SearchControl({ position: 'topright' })
    map.addControl(searchControl)

    return () => {
      map.removeControl(searchControl)
    }
  }, [map, onSearchResult, isSearching])

  return null
}

export default SearchControl