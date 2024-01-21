import React, { useEffect, useState } from 'react'
import { LatLng, RestaurantsRequest, RoutesRequest, Stations } from '../types'
import { useQueryRestaurants } from '../hooks/useQueryRestaurant'
import { useQueryRoutes } from '../hooks/useQueryRoutes'

type PlanProps = {
  onStationSelect: (positions: LatLng[]) => void
  onStationSelectRoutes: (positions: (Stations[] | undefined)[]) => void
  restaurantsRequest: RestaurantsRequest | undefined
  routesRequest: RoutesRequest | undefined
  onBack: () => void
  onRestaurantsSelect: (coordinates: LatLng[]) => void
  onActiveRestaurantIndexChange: (index: number) => void
}

interface TabButtonProps {
  index: number
  isActive: boolean
  onClick: (index: number) => void
}

interface Restaurant {
  name: string
  address: string
  lat: number
  lng: number
  access: string
  budget: string
  open: string
  coupon_urls: string
  image_url: string
}

interface RestaurantInfoProps {
  restaurant: Restaurant
}

interface OpeningHoursProps {
  text: string
}

export const Plan: React.FC<PlanProps> = (props) => {
  const {
    onStationSelect,
    onStationSelectRoutes,
    restaurantsRequest,
    routesRequest,
    onBack,
    onRestaurantsSelect,
    onActiveRestaurantIndexChange,
  } = props

  const { queryRestaurants } = useQueryRestaurants()
  const {
    data: restaurantData,
    isLoading: restaurantIsLoading,
    error: restaurantError,
  } = queryRestaurants

  useEffect(() => {
    if (restaurantsRequest?.stations !== undefined) {
      queryRestaurants.mutate(restaurantsRequest)
    }
    // eslint-disable-next-line
  }, [restaurantsRequest?.stations])

  const { queryRoutes } = useQueryRoutes()
  const {
    data: routesData,
    isLoading: routesIsLoading,
    error: routesError,
  } = queryRoutes

  useEffect(() => {
    if (routesRequest?.destination_stations !== undefined) {
      queryRoutes.mutate(routesRequest)
    }
    // eslint-disable-next-line
  }, [routesRequest?.destination_stations])

  const [selectedStationIndex, setSelectedStationIndex] = useState(0)
  const [activeRestaurantTab, setActiveRestaurantTab] = useState(0)

  useEffect(() => {
    if (!routesData || !restaurantsRequest) {
      return
    }
    const selectedStation = restaurantsRequest.stations[selectedStationIndex]
    onStationSelectRoutes([])
    const newRoutesPositions = routesData.destinations
      .filter((destination) => destination.destination === selectedStation)
      .map((destination) => destination.routes)

    onStationSelectRoutes(newRoutesPositions)
    // eslint-disable-next-line
  }, [selectedStationIndex, routesData, restaurantsRequest])

  useEffect(() => {
    if (restaurantData === undefined) {
      return
    }
    const stationRestaurants = restaurantData[selectedStationIndex].stations
    const restaurantCoordinates = stationRestaurants?.map((restaurant) => ({
      lat: restaurant.lat,
      lng: restaurant.lng,
    }))

    if (restaurantCoordinates) {
      onRestaurantsSelect(restaurantCoordinates)
    }

    // 選択されているレストランのインデックスを親コンポーネントに渡す
    onActiveRestaurantIndexChange(activeRestaurantTab)
    // eslint-disable-next-line
  }, [selectedStationIndex, activeRestaurantTab, restaurantData])

  const TabButton: React.FC<TabButtonProps> = ({
    index,
    isActive,
    onClick,
  }) => (
    <button
      className={`px-9 py-3 ${
        isActive ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'
      }`}
      onClick={() => onClick(index)}
    >
      {index + 1}
    </button>
  )

  const OpeningHours: React.FC<OpeningHoursProps> = ({ text }) => {
    const lines = text
      .split('）')
      .map((line, index, array) =>
        index < array.length - 1 ? line + '）' : line
      )

    return (
      <div>
        {lines.map((line, index) => (
          <p className="text-sm" key={index}>
            {line}
          </p>
        ))}
      </div>
    )
  }

  const RestaurantInfo: React.FC<RestaurantInfoProps> = ({ restaurant }) => (
    <>
      <div className="border p-4 rounded shadow">
        <h3 className="font-bold text-lg">{restaurant.name}</h3>
        <br />
        <p>{restaurant.address}</p>
        <p>{restaurant.access}</p>
        <p>{restaurant.budget}</p>
        <br />
        <OpeningHours text={restaurant.open} />
        <br />
        <a
          href={restaurant.coupon_urls}
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          クーポン
        </a>
        <div className="flex overflow-x-auto gap-4">
          <img
            className="mt-4 rounded shadow flex-shrink-0 w-96"
            src={`${restaurant.image_url}`}
            alt="Additional"
          />
          <img
            className="mt-4 rounded shadow flex-shrink-0"
            src={`https://maps.googleapis.com/maps/api/streetview?location=${restaurant.lat},${restaurant.lng}&size=400x400&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`}
            alt="Street view of the restaurant"
          />
        </div>
      </div>
    </>
  )

  if (restaurantError || routesError) {
    return (
      <>
        <div>エラーが発生しました</div>
        <button
          className={'px-4 py-2 bg-gray-200'}
          onClick={() => {
            onBack()
            onStationSelect([])
            onRestaurantsSelect([])
            onStationSelectRoutes([])
          }}
        >
          再入力する
        </button>
      </>
    )
  }

  if (restaurantIsLoading || routesIsLoading) {
    return <div>計算中...</div>
  }

  return (
    <div className="mx-auto overflow-y-auto">
      <div className="flex flex-wrap space-x-2 p-4">
        {restaurantData &&
          restaurantData.map((_, index) => (
            <button
              key={index}
              className={`px-4 py-2 ${
                selectedStationIndex === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
              onClick={() => {
                setSelectedStationIndex(index)
                setActiveRestaurantTab(0)
              }}
            >
              {restaurantsRequest?.stations[index]}
            </button>
          ))}
        <button
          className={'px-4 py-2 bg-gray-200'}
          onClick={() => {
            onBack()
            onStationSelect([])
            onRestaurantsSelect([])
            onStationSelectRoutes([])
          }}
        >
          再入力する
        </button>
      </div>
      <div className="flex space-x-2 border-b">
        {restaurantData &&
          restaurantData[selectedStationIndex]?.stations.map(
            (restaurant, index) => (
              <TabButton
                key={index}
                index={index}
                isActive={index === activeRestaurantTab}
                onClick={() => setActiveRestaurantTab(index)}
              />
            )
          )}
      </div>
      <div className="p-4">
        {restaurantData &&
          restaurantData[selectedStationIndex]?.stations[
            activeRestaurantTab
          ] && (
            <RestaurantInfo
              restaurant={
                restaurantData[selectedStationIndex].stations[
                  activeRestaurantTab
                ]
              }
            />
          )}
      </div>
    </div>
  )
}
