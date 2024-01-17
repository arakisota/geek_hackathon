import React from 'react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

const containerStyle = {
  width: '100vh',
  height: '100vh',
}

const center = {
  lat: 35.6894,
  lng: 139.6917,
}

const positions = [
  { lat: 35.689487, lng: 139.691706 },
  { lat: 35.693738, lng: 139.502165 },
]

export const Map: React.FC = () => {
  return (
    <div className="flex justify-center items-center flex-col min-h-screen text-gray-600 font-mono">
      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string}
      >
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={11}>
          {positions.map((position, index) => (
            <Marker key={index} position={position} />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  )
}
