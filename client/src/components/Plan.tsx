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
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md'

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
              {dummyPlans.map((plan, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 bg-white rounded-lg shadow"
                >
                  <div className="flex justify-between items-center mb-2">
                    {getNumberIcon(index, false)}
                    <h2 className="text-xl font-semibold">{plan.name}</h2>
                    <GrAnnounce size={24} />
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <PlanItem key={plan.id} plan={plan} />
                  </div>
                </div>
              ))}
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

interface PlanData {
  id: number
  name: string
  restaurants: Restaurant[]
}

// プラン項目コンポーネント
const PlanItem: React.FC<{ plan: PlanData }> = ({ plan }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isOpenRestaurant, setIsOpenRestaurant] = useState<boolean[]>([
    false,
    false,
  ])

  return (
    <div>
      <button
        className="flex justify-center items-center w-full py-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {!isOpen ? (
          <MdKeyboardArrowDown size={20} />
        ) : (
          <MdKeyboardArrowUp size={20} />
        )}
      </button>
      {isOpen && (
        <div className="flex flex-col">
          {plan.restaurants.map((restaurant, index, arr) => (
            <div key={index} className="flex">
              <div className="flex flex-col items-center pr-2">
                <div className="bg-gray-500 rounded-full h-4 w-4"></div>
                {/* タイムラインドット */}
                {index < arr.length - 1 && ( // 最後のアイテムでなければコネクタを表示
                  <div className="w-0.5 bg-gray-500 h-full"></div>
                )}
              </div>
              <button
                className="w-full text-left transition-shadow duration-300 ease-in-out shadow hover:shadow-2xl"
                onClick={() => {
                  if (index === 0)
                    setIsOpenRestaurant([
                      !isOpenRestaurant[0],
                      isOpenRestaurant[1],
                    ])
                  else
                    setIsOpenRestaurant([
                      isOpenRestaurant[0],
                      !isOpenRestaurant[1],
                    ])
                }}
              >
                {isOpenRestaurant[index] ? (
                  <RestaurantInfo restaurant={restaurant} index={index} />
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

// ダミーのプランデータ
const dummyPlans: PlanData[] = [
  {
    id: 1,
    name: '地元の味がここに集う、夜を彩る隠れ家バル',
    restaurants: [
      {
        name: '肉バル 月光 五反田店',
        address: '東京都品川区西五反田１－１８－１',
        access: '五反田駅徒歩3分　夜景を一望できるシュラスコレストラン！',
        lat: 35.6236690572,
        lng: 139.7228991698,
        budget: '3000円（五反田駅3分 肉寿司\u0026和牛ステーキ食べ放題）',
        open: '月～日: 12:00～23:00 （料理L.O. 22:00 ドリンクL.O. 22:30）祝日、祝前日: 12:00～23:00',
        coupon_urls:
          'https://www.hotpepper.jp/strJ003737378/map/?vos=nhppalsa000016',
        image_url:
          'https://imgfp.hotp.jp/IMGH/52/57/P043465257/P043465257_238.jpg',
      },
      {
        name: '大衆IZAKAYAエイト 大崎店',
        address: '東京都品川区大崎３-6-17 ニュー大崎ビル2階',
        access:
          'りんかい線,JR大崎駅西口より徒歩約1分/東急池上線大崎広小路駅出口より徒歩約10分',
        lat: 35.6196149059,
        lng: 139.7272081344,
        budget: '3000円(通常予算) 4000円(宴会予算)',
        open: '月～金、祝前日: 11:30～14:30 （料理L.O. 14:00 ドリンクL.O. 14:00）16:30～23:00 （料理L.O. 22:20 ドリンクL.O. 22:30）土: 16:30～23:00 （料理L.O. 22:20 ドリンクL.O. 22:30）',
        coupon_urls:
          'https://www.hotpepper.jp/strJ001215620/map/?vos=nhppalsa000016',
        image_url:
          'https://imgfp.hotp.jp/IMGH/58/61/P032135861/P032135861_238.jpg',
      },
    ],
  },
  {
    id: 2,
    name: 'カジュアルな雰囲気で楽しむ！！！',
    restaurants: [
      {
        name: '酒場TOKYO',
        address: '東京都品川区西五反田１-32-5アネックス第2ビル1階',
        access:
          'ＪＲ 五反田駅 西口 徒歩3分/都営浅草線 五反田駅 徒歩3分/東急池上線 大崎広小路駅 徒歩3分',
        lat: 35.6240670448,
        lng: 139.7220289497,
        budget: 'ディナー3001～4000円',
        open: '月～木、祝日、祝前日: 11:30～14:00 （料理L.O. 13:30 ドリンクL.O. 13:30）17:00～翌3:00 （料理L.O. 翌2:00 ドリンクL.O. 翌2:30）金、土: 11:30～14:00 （料理L.O. 13:30 ドリンクL.O. 13:30）17:00～翌5:00 （料理L.O. 翌4:00 ドリンクL.O. 翌4:30）日: 11:30～14:00 （料理L.O. 13:30 ドリンクL.O. 13:30）17:00～翌1:00 （料理L.O. 翌0:00 ドリンクL.O. 翌0:30）',
        coupon_urls:
          'https://www.hotpepper.jp/strJ003549001/map/?vos=nhppalsa000016',
        image_url:
          'https://imgfp.hotp.jp/IMGH/64/46/P042056446/P042056446_238.jpg',
      },
      {
        name: '【焼肉 生ホルモン 食べ放題 \u0026 レモンサワー 飲み放題】 レモホル酒場　五反田店',
        address: '東京都品川区東五反田１-21-3',
        access:
          'JR山手線・東急五反田線・東京メトロ浅草線『五反田』駅 徒歩3分/五反田駅から226m',
        lat: 35.6259813854,
        lng: 139.7261815765,
        budget: '2000円',
        open: '月～日、祝日、祝前日: 17:00～23:00 （料理L.O. 22:30 ドリンクL.O. 22:30）',
        coupon_urls:
          'https://www.hotpepper.jp/strJ003297031/map/?vos=nhppalsa000016',
        image_url:
          'https://imgfp.hotp.jp/IMGH/54/24/P042805424/P042805424_238.jpg',
      },
    ],
  },
  {
    id: 3,
    name: 'あなたを魅了する、隠れ家的名店の秘密の味',
    restaurants: [
      {
        name: '鶏料理と釜めし 居酒屋 かまどか 五反田東口店',
        address: '東京都品川区東五反田２－２－１６　富久屋・ニッカ共同ビル１F',
        access:
          '東急池上線・地下鉄都営浅草線・JR五反田駅東口3分◎駅近居酒屋「かまどか」3時間飲み放題付コース3,000円～◎',
        lat: 35.6254836277,
        lng: 139.7248417101,
        budget: '当日OK！単品飲み放題2時間1,650円（税込）～',
        open: '月～木、土、日、祝日: 16:00～23:00 （料理L.O. 22:30 ドリンクL.O. 22:30）金: 16:00～翌1:00 （料理L.O. 翌0:00 ドリンクL.O. 翌0:00）',
        coupon_urls:
          'https://www.hotpepper.jp/strJ000022000/map/?vos=nhppalsa000016',
        image_url:
          'https://imgfp.hotp.jp/IMGH/27/50/P043702750/P043702750_238.jpg',
      },
      {
        name: '肉バル 月光 五反田店',
        address: '東京都品川区西五反田１－１８－１',
        access: '五反田駅徒歩3分　夜景を一望できるシュラスコレストラン！',
        lat: 35.6236690572,
        lng: 139.7228991698,
        budget: '3000円（五反田駅3分 肉寿司\u0026和牛ステーキ食べ放題）',
        open: '月～日: 12:00～23:00 （料理L.O. 22:00 ドリンクL.O. 22:30）祝日、祝前日: 12:00～23:00',
        coupon_urls:
          'https://www.hotpepper.jp/strJ003737378/map/?vos=nhppalsa000016',
        image_url:
          'https://imgfp.hotp.jp/IMGH/52/57/P043465257/P043465257_238.jpg',
      },
    ],
  },
]
