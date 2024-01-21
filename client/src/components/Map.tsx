import React, { useState, useEffect, useRef } from 'react'
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api'
import { LatLng, RestaurantsRequest, RoutesRequest, Stations } from '../types'
import { mapStyle } from '../types/mapStyle'
import { Form } from './Form'
import { Plan } from './Plan'
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
  const [routesRequest, setRoutesRequest] = useState<RoutesRequest>()

  const [isFormVisible, setIsFormVisible] = useState(true)

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible)
  }

  const [showForm, setShowForm] = useState(true)

  const handleFormSubmit = () => {
    setShowForm(false)
  }

  const handleBackToForm = () => {
    setShowForm(true)
  }

  const [restaurantPositions, setRestaurantPositions] = useState<LatLng[]>([])
  const [selectedRestaurantIndex, setSelectedRestaurantIndex] = useState<
    number | null
  >(null)

  const handleRestaurantsSelect = (coordinates: LatLng[]) => {
    setRestaurantPositions(coordinates)
  }

  const handleActiveRestaurantIndexChange = (index: number) => {
    setSelectedRestaurantIndex(index)
  }

  const [stationPositions, setStationPositions] = useState<LatLng[]>([])
  const [routePositions, setRoutePositions] = useState<
    (Stations[] | undefined)[]
  >([])

  console.log(routePositions)

  const handleStationSelect = (positions: LatLng[]) => {
    setStationPositions(positions)
  }

  const handleStationRoutesSelect = (positions: (Stations[] | undefined)[]) => {
    setRoutePositions(positions)
  }

  useEffect(() => {
    if (mapRef.current && stationPositions.length > 0) {
      setRoutePositions([])

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
    strokeWeight: 10,
  }

  return (
    <div className="relative">
      {showForm ? (
        <>
          <div className="absolute top-0 left-0 z-10 p-4 ml-4 mt-4 max-w-xl bg-white rounded shadow-lg">
            <button onClick={toggleFormVisibility}>
              {isFormVisible ? <FaChevronDown /> : <FaChevronRight />}
            </button>
            <div style={{ display: isFormVisible ? 'block' : 'none' }}>
              <Form
                onStationSelect={handleStationSelect}
                setRestaurantsRequest={setRestaurantsRequest}
                setRoutesRequest={setRoutesRequest}
                onSubmit={handleFormSubmit}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="absolute top-0 left-0 z-10 p-4 ml-4 mt-4 max-w-xl bg-white rounded shadow-lg max-h-[95%] overflow-y-auto">
          <button onClick={toggleFormVisibility}>
            {isFormVisible ? <FaChevronDown /> : <FaChevronRight />}
          </button>
          <div style={{ display: isFormVisible ? 'block' : 'none' }}>
            <Plan
              onStationSelect={handleStationSelect}
              onStationSelectRoutes={handleStationRoutesSelect}
              restaurantsRequest={restaurantsRequest}
              routesRequest={routesRequest}
              onBack={handleBackToForm}
              onRestaurantsSelect={handleRestaurantsSelect}
              onActiveRestaurantIndexChange={handleActiveRestaurantIndexChange}
            />
          </div>
        </div>
      )}
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

        {selectedRestaurantIndex !== null &&
        routePositions[selectedRestaurantIndex]
          ? routePositions[selectedRestaurantIndex]?.map((route, index) => (
              <Polyline
                key={index}
                path={route.stations}
                options={polylineOptions}
              />
            ))
          : null}

        {restaurantPositions.map((position, index) => (
          <Marker
            key={index}
            position={position}
            icon={
              selectedRestaurantIndex === index
                ? {
                    url: 'path_to_selected_icon',
                    scaledSize: new google.maps.Size(30, 45),
                  }
                : undefined
            }
            label={String(index + 1)}
          />
        ))}
      </GoogleMap>
    </div>
  )
}
