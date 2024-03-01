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
import { FaTrainSubway } from 'react-icons/fa6'
import { GrAnnounce } from 'react-icons/gr'
import {
  TbSquareRoundedNumber1Filled,
  TbSquareRoundedNumber1,
  TbSquareRoundedNumber2Filled,
  TbSquareRoundedNumber2,
  TbSquareRoundedNumber3Filled,
  TbSquareRoundedNumber3,
  TbSquareRoundedNumber4Filled,
  TbSquareRoundedNumber4,
  TbSquareRoundedNumber5Filled,
  TbSquareRoundedNumber5,
} from 'react-icons/tb'

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
  index: number
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
  const [activeRestaurant, setActiveRestaurant] = useState(-1)
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
    onActiveRestaurantIndexChange(activeRestaurant)
    // eslint-disable-next-line
  }, [selectedStationIndex, activeRestaurant, restaurantData])

  const toggleRestaurantInfo = (index: number) => {
    // クリックされた店舗が既に展開されている場合は、情報を隠します。そうでなければ、新しく展開します。
    setActiveRestaurant((prevIndex) => (prevIndex === index ? -1 : index))
  }

  const [activeTab, setActiveTab] = useState('restaurants')

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
    return <div className="text-center"> 計算中... </div>
  }

  return (
    <>
      {/* トップバー */}
      <div className="mx-auto overflow-y-auto">
        <div className="fixed flex w-full rounded md:max-w-lg nowrap whitespace-nowrap justify-between space-x-2 px-4 py-2 overflow-x-auto bg-white">
          <div className="flex space-x-2">
            <button
              className={`px-2 ${
                activeTab === 'restaurants'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:border-b-2 hover:border-blue-100'
              }`}
              onClick={() => setActiveTab('restaurants')}
            >
              お店
            </button>
            <button
              className={`px-2 ${
                activeTab === 'plans'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:border-b-2 hover:border-blue-100'
              }`}
              onClick={() => setActiveTab('plans')}
            >
              プラン
            </button>
          </div>

          <div className="relative inline-block text-black">
            <FaTrainSubway className="absolute left-0 top-0 ml-3 mt-3 pointer-events-none" />
            <select
              className="pl-10 pr-4 py-2 rounded border border-gray-500 appearance-none"
              value={selectedStationIndex}
              onChange={(e) => setSelectedStationIndex(Number(e.target.value))}
            >
              {destStations.map((station, index) => (
                <option key={index} value={index}>
                  {station}
                </option>
              ))}
            </select>
          </div>

          <button
            className={'px-4 py-2 rounded bg-gray-200'}
            onClick={handleReset}
          >
            {roomId === userId ? '再入力する' : 'フォームに戻る'}
          </button>
        </div>

        {/* お店一覧・プラン一覧 */}
        <div className="mt-12 px-2 pt-4">
          {activeTab === 'restaurants' ? (
            <>
              {restaurantData &&
                restaurantData[selectedStationIndex]?.stations.map(
                  (restaurant, index) => (
                    <div key={index} className="mb-2">
                      <button
                        className="w-full text-left transition-shadow duration-300 ease-in-out shadow hover:shadow-2xl"
                        onClick={() => toggleRestaurantInfo(index)}
                      >
                        {activeRestaurant === index ? (
                          <RestaurantInfo
                            restaurant={restaurant}
                            index={index}
                          />
                        ) : (
                          <div className="border rounded shadow flex flex-col items-center">
                            <img
                              className="w-full h-32 object-cover rounded"
                              src={restaurant.image_url}
                              alt={restaurant.name}
                            />
                            <div className="flex m-1">
                              {getNumberIcon(index, false)}
                              <h3 className="font-bold text-lg pl-1">
                                {restaurant.name}
                              </h3>
                            </div>
                          </div>
                        )}
                      </button>
                    </div>
                  )
                )}
            </>
          ) : (
            <>
              <div>
                {dummyPlans.map((plan, index) => (
                  <div key={index} className="flex justify-between">
                    <PlanItem key={plan.id} plan={plan} />
                    <GrAnnounce size={24} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

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

const RestaurantInfo: React.FC<RestaurantInfoProps> = ({
  restaurant,
  index,
}) => (
  <>
    <div className="border p-4 rounded shadow">
      <div className="flex">
        {getNumberIcon(index, true)}
        <h3 className="font-bold text-lg pl-1">{restaurant.name}</h3>
      </div>
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

interface DummyRestaurant {
  name: string
  // 他にもレストランに関連するプロパティがあればここに追加
}

interface Plan {
  id: number
  name: string
  restaurants: DummyRestaurant[]
}

// ダミーのプランデータ
const dummyPlans: Plan[] = [
  {
    id: 1,
    name: 'プラン 1',
    restaurants: [{ name: 'レストラン A' }, { name: 'レストラン B' }],
  },
  {
    id: 2,
    name: 'プラン 2',
    restaurants: [{ name: 'レストラン C' }, { name: 'レストラン D' }],
  },
]

// プラン項目コンポーネント
const PlanItem: React.FC<{ plan: Plan }> = ({ plan }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button
        className="w-full text-left py-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {plan.name}
      </button>
      {isOpen && (
        <div className="flex flex-col">
          {plan.restaurants.map((restaurant, index, arr) => (
            <div key={index} className="flex">
              <div className="flex flex-col items-center">
                <div className="bg-blue-500 rounded-full h-4 w-4"></div>{' '}
                {/* タイムラインドット */}
                {index < arr.length - 1 && ( // 最後のアイテムでなければコネクタを表示
                  <div className="w-0.5 bg-blue-500 h-8"></div>
                )}
              </div>
              <div className="ml-4">{restaurant.name}</div>{' '}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const getNumberIcon = (index: number, flag: boolean) => {
  switch (index) {
    case 0:
      return flag ? (
        <TbSquareRoundedNumber1 size={26} />
      ) : (
        <TbSquareRoundedNumber1Filled size={26} />
      )
    case 1:
      return flag ? (
        <TbSquareRoundedNumber2 size={26} />
      ) : (
        <TbSquareRoundedNumber2Filled size={26} />
      )
    case 2:
      return flag ? (
        <TbSquareRoundedNumber3 size={26} />
      ) : (
        <TbSquareRoundedNumber3Filled size={26} />
      )
    case 3:
      return flag ? (
        <TbSquareRoundedNumber4 size={26} />
      ) : (
        <TbSquareRoundedNumber4Filled size={26} />
      )
    case 4:
      return flag ? (
        <TbSquareRoundedNumber5 size={26} />
      ) : (
        <TbSquareRoundedNumber5Filled size={26} />
      )
    default:
      return null
  }
}
