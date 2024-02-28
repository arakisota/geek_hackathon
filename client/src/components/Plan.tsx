import React, { useEffect, useState } from 'react'
import {
  LatLng,
  RestaurantsRequest,
  RestaurantsResponse,
  RoutesRequest,
  RoutesResponse,
  Stations,
} from '../types'
import { UseMutationResult } from '@tanstack/react-query'

type PlanProps = {
  userId: string
  roomId: string
  onStationSelect: (positions: LatLng[]) => void
  onStationSelectRoutes: (positions: (Stations[] | undefined)[]) => void
  queryRestaurants: UseMutationResult<
    RestaurantsResponse,
    Error,
    RestaurantsRequest,
    unknown
  >
  queryRoutes: UseMutationResult<RoutesResponse, Error, RoutesRequest, unknown>
  restaurantData: RestaurantsResponse | undefined
  routesData: RoutesResponse | undefined
  destStations: string[]
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
    userId,
    roomId,
    onStationSelect,
    onStationSelectRoutes,
    queryRestaurants,
    queryRoutes,
    restaurantData,
    routesData,
    destStations,
    onBack,
    onRestaurantsSelect,
    onActiveRestaurantIndexChange,
  } = props

  // -------------------------- Restaurants --------------------------
  // '/staions'エンドポイントのレスポンスに応じて駅周辺のお店情報を取得
  const {
    // eslint-disable-next-line
    data: _restaurantData,
    isLoading: restaurantIsLoading,
    error: restaurantError,
  } = queryRestaurants

  // -------------------------- Routes --------------------------
  // '/staions'エンドポイントのレスポンスに応じて各出発駅から目的地までの経路情報を取得
  const {
    // eslint-disable-next-line
    data: _routesData,
    isLoading: routesIsLoading,
    error: routesError,
  } = queryRoutes

  // -------------------------- Station --------------------------
  // プラン上で現在選択している駅、地図上でレストランのマーカー表示、経路表示で利用
  const [selectedStationIndex, setSelectedStationIndex] = useState(0)
  useEffect(() => {
    if (!routesData || destStations.length === 0) {
      return
    }
    const selectedStation = destStations[selectedStationIndex]
    onStationSelectRoutes([])
    const newRoutesPositions = routesData.destinations
      .filter((destination) => destination.destination === selectedStation)
      .map((destination) => destination.routes)

    onStationSelectRoutes(newRoutesPositions)
    // eslint-disable-next-line
  }, [selectedStationIndex, routesData, destStations])

  // -------------------------- RestaurantTab --------------------------
  // プラン上で現在閲覧しているレストラン、地図上でマーカーを強調させるために使用
  const [activeRestaurantTab, setActiveRestaurantTab] = useState(0)
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

  const handleReset = () => {
    onBack()
    onStationSelect([])
    onRestaurantsSelect([])
    onStationSelectRoutes([])
  }

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
          {roomId === userId ? '再入力する' : 'フォームに戻る'}
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
              {destStations[index]}
            </button>
          ))}
        <button className={'px-4 py-2 bg-gray-200'} onClick={handleReset}>
          {roomId === userId ? '再入力する' : 'フォームに戻る'}
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
