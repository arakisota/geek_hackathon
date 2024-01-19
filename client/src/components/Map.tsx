import React, { useState, useEffect } from 'react'
import {
  GoogleMap,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from '@react-google-maps/api'
import { mapStyle } from '../types/mapStyle'

const containerStyle = {
  width: '100%', // 修正: 'full' -> '100%'
  height: '100vh',
}

const center = {
  lat: 35.6894,
  lng: 139.6917,
}

const positions = [
  { lat: 35.6894, lng: 139.6917 },
  { lat: 35.693738, lng: 139.502165 },
]

export const Map: React.FC = () => {
  const [directionsRequest, setDirectionsRequest] =
    useState<google.maps.DirectionsRequest | null>(null)

  const [directionsResponse, setDirectionsResponse] =
    useState<google.maps.DirectionsResult | null>(null)

  const [markers, setMarkers] = useState<google.maps.LatLngLiteral[]>([])

  useEffect(() => {
    if (positions.length >= 2) {
      setDirectionsRequest({
        origin: positions[0],
        destination: positions[1],
        travelMode: google.maps.TravelMode.DRIVING,
      })
    }
  }, [positions])

  return (
    <div className="relative">
      <div className="absolute top-0 left-0 z-10 p-4 ml-4 mt-4 max-w-xs bg-white rounded shadow-lg">
        <form>
          <div className="mb-4">
            <label
              htmlFor="location"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              位置:
            </label>
            <input
              type="text"
              id="location"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="位置を入力"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            送信
          </button>
        </form>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        options={{
          styles: mapStyle,
          streetViewControl: false,
          mapTypeControl: true,
          mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
          },
        }}
      >
        {positions.map((position, index) => (
          <Marker key={index} position={position} />
        ))}

        {/* {directionsRequest && (
          <DirectionsService
            options={directionsRequest}
            callback={(res, status) => {
              if (status === google.maps.DirectionsStatus.OK) {
                setDirectionsResponse(res)
              } else {
                console.error('Directions request failed due to ' + status)
              }
            }}
          />
        )}

        {directionsResponse && (
          <DirectionsRenderer
            options={{
              directions: directionsResponse,
            }}
          />
        )} */}
      </GoogleMap>
    </div>
  )
}
