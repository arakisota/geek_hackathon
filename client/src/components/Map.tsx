import React, { useState, useEffect } from 'react'
import {
  GoogleMap,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from '@react-google-maps/api'
import { mapStyle } from '../types/mapStyle'
import { Form } from './Form'
import { useMutateAuth, MutateAuthProps } from '../hooks/useMutateAuth'

export type MapProps = {
  setIsLogined: (state: boolean) => void
}

const containerStyle = {
  width: '100%',
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

export const Map: React.FC<MapProps> = (props) => {
  const { setIsLogined } = props

  const { logoutMutation } = useMutateAuth({
    setIsLogined,
  } as MutateAuthProps)

  const logout = async () => {
    await logoutMutation.mutateAsync()
  }

  const [directionsRequest, setDirectionsRequest] =
    useState<google.maps.DirectionsRequest | null>(null)

  const [directionsResponse, setDirectionsResponse] =
    useState<google.maps.DirectionsResult | null>(null)

  // const [markers, setMarkers] = useState<google.maps.LatLngLiteral[]>([])

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
        <Form />
      </div>
      <div className="absolute top-0 right-0 z-10 p-4 mr-4 mt-4 max-w-xs bg-white rounded shadow-lg">
        <button onClick={logout}>ログアウト</button>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        options={{
          styles: mapStyle,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: true,
          mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
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
