import React, { useState, useEffect, useRef } from 'react'
import {
  GoogleMap,
  Marker,
  // DirectionsService,
  // DirectionsRenderer,
  Polyline,
} from '@react-google-maps/api'
import { mapStyle } from '../types/mapStyle'
import { Form } from './Form'
import { Plan } from './Plan'
import { LatLng, RestaurantsRequest } from '../types'
import { useMutateAuth, MutateAuthProps } from '../hooks/useMutateAuth'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'

type MapProps = {
  setIsLogined: (state: boolean) => void
}

const containerStyle = {
  width: '100%',
  height: '100vh',
}

const defaultCenter = { lat: 35.6895, lng: 139.6917 }

export const Map: React.FC<MapProps> = (props) => {
  const mapRef = useRef<google.maps.Map>()

  const { setIsLogined } = props

  const { logoutMutation } = useMutateAuth({
    setIsLogined,
  } as MutateAuthProps)

  const logout = async () => {
    await logoutMutation.mutateAsync()
  }

  const [restaurantsRequest, setRestaurantsRequest] =
    useState<RestaurantsRequest>()

  const [stationPositions, setStationPositions] = useState<LatLng[]>([])

  const [isFormVisible, setIsFormVisible] = useState(true)

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible)
  }

  const handleStationSelect = (positions: LatLng[]) => {
    setStationPositions(positions)
  }

  useEffect(() => {
    if (mapRef.current && stationPositions.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      stationPositions.forEach((stationPosition) => {
        bounds.extend(stationPosition)
      })
      mapRef.current.fitBounds(bounds)
    }
  }, [stationPositions])

  const polylineOptions = {
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2,
  }

  return (
    <div className="relative">
      <div className="absolute top-0 left-0 z-10 p-4 ml-4 mt-4 max-w-xs bg-white rounded shadow-lg">
        <button onClick={toggleFormVisibility}>
          {isFormVisible ? <FaChevronDown /> : <FaChevronRight />}
        </button>
        <div style={{ display: isFormVisible ? 'block' : 'none' }}>
          <Form
            onStationSelect={handleStationSelect}
            setRestaurantsRequest={setRestaurantsRequest}
          />
          <Plan restaurantsRequest={restaurantsRequest} />
        </div>
      </div>
      <div className="absolute top-0 right-0 z-10 p-4 mr-4 mt-4 max-w-xs bg-white rounded shadow-lg">
        <button onClick={logout}>ログアウト</button>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
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
        onLoad={(map) => {
          mapRef.current = map
          return void 0 // 明示的にvoid型を返す
        }}
      >
        {stationPositions.map((position, index) => (
          <Marker key={index} position={position} />
        ))}

        {stationPositions.length >= 2 && (
          <Polyline path={stationPositions} options={polylineOptions} />
        )}
      </GoogleMap>
    </div>
  )
}
