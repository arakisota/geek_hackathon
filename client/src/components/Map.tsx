import React, { useState, useEffect, useRef } from 'react'
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api'
import { LatLng, RestaurantsResponse, RoutesResponse, Stations } from '../types'
import { mapStyle } from '../types/mapStyle'
import { Form } from './Form'
import { Plan } from './Plan'
import { useQueryStations, QueryStationsProps } from '../hooks/useQueryStations'
import { useMutateAuth, MutateAuthProps } from '../hooks/useMutateAuth'
import { FaWpforms } from 'react-icons/fa'
import { FaAnglesLeft, FaAnglesRight } from 'react-icons/fa6'
import { MdOutlineChat, MdOutlineMarkUnreadChatAlt } from 'react-icons/md'
import { TbLogout, TbSend } from 'react-icons/tb'
import togather from '../assets/toGather.png'

type MapProps = {
  userId: string
  roomId: string
  setIsLogined: (state: boolean) => void
  ws: WebSocket | null
  setWs: (ws: WebSocket | null) => void
}

const containerStyle = {
  width: '100%',
  height: '100vh',
}

const defaultCenter = { lat: 35.6895, lng: 139.6917 }

export const Map: React.FC<MapProps> = (props) => {
  const mapRef = useRef<google.maps.Map>()
  const { userId, roomId, setIsLogined, ws, setWs } = props
  const { logoutMutation } = useMutateAuth({
    roomId,
    setIsLogined,
    ws,
    setWs,
  } as MutateAuthProps)
  const logout = async () => {
    await logoutMutation.mutateAsync()
  }

  // -------------------------- Websocket --------------------------
  // 部屋の作成、ログイン、ログアウト、チャット、ホストのレストラン/経路情報の取得
  const token = localStorage.getItem('token')
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [isChatVisible, setIsChatVisible] = useState<boolean>(false)
  const [chatPositionLeft, setChatPositionLeft] = useState<boolean>(true)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  useEffect(() => {
    const websocket = new WebSocket(
      `ws://localhost:8080/ws?token=${token}&room_id=${roomId}`
    )
    websocket.onopen = () => {
      const loginMessage = JSON.stringify({
        type: 'login',
        content: '',
      })
      websocket.send(loginMessage)
    }
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      switch (data.type) {
        case 'login':
          setMessages((prev) => [...prev, event.data])
          break

        case 'logout':
          if (data.userId == roomId) {
            alert('ホストとの通信が切断されました')
            logout()
            break
          }
          setMessages((prev) => [...prev, event.data])
          break

        case 'message':
          setMessages((prev) => [...prev, event.data])
          break

        case 'stations':
          setMessages((prev) => [...prev, event.data])
          break

        case 'restaurants':
          setRestaurantData(data.stations)
          setIsFormVisible(true)
          handleFormSubmit()
          setMessages((prev: string[]) => {
            const prevData = JSON.parse(prev[prev.length - 1])
            if (prevData.type === 'stations') {
              const dataForm = {
                type: data.type,
                requests: data.requests,
                departures: prevData.stations.departures,
              }
              return [
                ...prev.slice(0, prev.length - 1),
                JSON.stringify(dataForm),
              ]
            }
            return [...prev]
          })
          break

        case 'routes':
          setRoutesData(data.routes)
          const destinations = data.routes.destinations.map(
            (dest: any) => dest.destination
          )
          setDestStations(destinations)
          break

        default:
          console.log('Unknown message type:', data.type)
      }
    }
    setWs(websocket)
    return () => {
      websocket.onopen = null
      websocket.onmessage = null
      //   websocket.close();
    }
  }, [])
  const sendMessage = () => {
    if (ws && input.trim()) {
      const chatMessage = JSON.stringify({
        type: 'message',
        content: input,
      })
      ws.send(chatMessage)
      setInput('')
    }
  }
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  useEffect(() => {
    scrollToBottom()
    if (!isChatVisible) setHasNewMessage(true)
  }, [messages])

  // -------------------------- Form --------------------------
  // フォーム上の操作、表示
  const [isFormVisible, setIsFormVisible] = useState(true)
  const [showForm, setShowForm] = useState(true)
  const handleFormSubmit = () => setShowForm(false)
  const handleBackToForm = () => setShowForm(true)

  // -------------------------- Restaurants --------------------------
  // 表示するレストラン情報
  const [restaurantData, setRestaurantData] = useState<RestaurantsResponse>()
  // 地図上でのレストランの位置
  const [restaurantPositions, setRestaurantPositions] = useState<LatLng[]>([])
  const handleRestaurantsSelect = (coordinates: LatLng[]) =>
    setRestaurantPositions(coordinates)
  // 現在閲覧しているレストランのindex
  const [selectedRestaurantIndex, setSelectedRestaurantIndex] = useState<
    number | null
  >(null)
  const handleActiveRestaurantIndexChange = (index: number) => {
    setSelectedRestaurantIndex(index)
    if (mapRef.current) {
      mapRef.current.setOptions({ maxZoom: 100 })
    }
  }

  // -------------------------- Stations --------------------------
  const [destStations, setDestStations] = useState<string[]>([])
  // 地図上での駅の位置
  const [stationPositions, setStationPositions] = useState<LatLng[]>([])
  const handleStationSelect = (positions: LatLng[]) =>
    setStationPositions(positions)

  // -------------------------- Routes --------------------------
  // 経路の計算結果
  const [routesData, setRoutesData] = useState<RoutesResponse>()
  // 出発駅と現在閲覧している駅の経路、経路描画
  const [routePositions, setRoutePositions] = useState<
    (Stations[] | undefined)[]
  >([])
  const handleStationRoutesSelect = (positions: (Stations[] | undefined)[]) =>
    setRoutePositions(positions)
  useEffect(() => {
    if (mapRef.current && stationPositions.length > 0) {
      setRoutePositions([])

      const bounds = new window.google.maps.LatLngBounds()
      stationPositions.forEach((stationPosition) => {
        bounds.extend(stationPosition)
      })
      if (stationPositions.length === 1) {
        mapRef.current.setOptions({ maxZoom: 15 })
      } else {
        mapRef.current.setOptions({ maxZoom: 12 })
      }
      mapRef.current.fitBounds(bounds, 210)
    }
  }, [stationPositions])
  const polylineOptions = {
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 10,
  }

  // -------------------------- Queries --------------------------
  const { queryStations, getStationName, queryRestaurants, queryRoutes } =
    useQueryStations({
      roomId,
    } as QueryStationsProps)

  // -------------------------- Convert --------------------------
  const convertPurpose = (purpose: string) => {
    if (purpose === 'meal') return '食事'
    if (purpose === 'drinking') return '飲み会'
    if (purpose === 'date') return 'デート'
    if (purpose === 'family') return '家族'
    if (purpose === 'cafe') return 'カフェ'
    return ''
  }

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 w-16 z-30">
        <div className="w-16 h-16 flex items-center justify-center">
          <img src={togather} className="w-12 h-10" />
        </div>
        <button
          className={`w-16 h-16 flex items-center justify-center ${
            isFormVisible ? 'text-black bg-white' : 'text-white'
          }`}
          onClick={() => setIsFormVisible(!isFormVisible)}
        >
          <FaWpforms size={24} />
        </button>
        <button
          className={`w-16 h-16 flex items-center justify-center text-white ${
            isChatVisible ? 'bg-black bg-opacity-50' : ''
          }`}
          onClick={() => {
            if (!isChatVisible) setHasNewMessage(false)
            setIsChatVisible(!isChatVisible)
          }}
        >
          {hasNewMessage ? (
            <MdOutlineMarkUnreadChatAlt size={24} color={'rgb(255, 0, 255)'} />
          ) : (
            <MdOutlineChat size={24} />
          )}
        </button>
        <div className="self-end">
          <button
            className="w-16 h-16 rounded-full flex items-center justify-center text-white"
            onClick={logout}
          >
            <TbLogout size={24} />
          </button>
        </div>
      </div>

      <div style={{ display: isChatVisible ? 'block' : 'none' }}>
        <div
          className={`fixed top-0 bottom-0 bg-black bg-opacity-50 w-full max-w-lg flex justify-center p-4 z-20 overflow-hidden ${
            chatPositionLeft ? 'ml-16 left-0' : 'right-0'
          }`}
        >
          <div className="w-full flex flex-col">
            <div className="w-full flex justify-between items-center">
              <FaAnglesLeft
                onClick={() => setChatPositionLeft(true)}
                className={`${
                  chatPositionLeft
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-white cursor-pointer'
                }`}
              />
              <div className="text-white text-sm">
                ホストのUserID / RoomID : {roomId}
              </div>
              <FaAnglesRight
                onClick={() => setChatPositionLeft(false)}
                className={`${
                  !chatPositionLeft
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-white cursor-pointer'
                }`}
              />
            </div>
            <hr className="my-4 border-gray-300" />
            <div className="p-4 flex-1 overflow-auto">
              <div className="space-y-2 w-full">
                {messages.map((message, index) => {
                  const data = JSON.parse(message)
                  let baseStyle =
                    'px-4 py-2 rounded-t-2xl break-words w-fit overflow-wrap: break-word'
                  let justifyContent =
                    data.userId === userId ? 'justify-end' : 'justify-start'

                  if (data.type === 'login' || data.type === 'logout') {
                    return (
                      <div
                        key={index}
                        className="text-center text-white text-sm"
                      >
                        {data.message}
                      </div>
                    )
                  } else if (data.type === 'restaurants') {
                    return (
                      <div
                        key={index}
                        className="text-center text-white text-sm"
                      >
                        <div>
                          --- ホストが以下の内容でフォームを送信しました ---
                        </div>
                        <div>人数 : {data.requests.people_num}人</div>
                        <div>
                          日時 :{' '}
                          {data.requests.arrival_time
                            .replaceAll('-', '/')
                            .replace('T', ' ')
                            .replace('Z', '')
                            .replace(':00', '')}
                        </div>
                        <div>
                          目的 : {convertPurpose(data.requests.purpose)}
                        </div>
                        <div className="flex justify-center overflow-wrap: break-word">
                          出発駅 :{' '}
                          {data.departures
                            .map((station: string) => station.replace('駅', ''))
                            .join(', ')}
                        </div>
                        <div>
                          -----------------------------------------------------
                        </div>
                      </div>
                    )
                  } else if (data.type === 'message') {
                    return (
                      <div key={index} className={`flex ${justifyContent}`}>
                        <div>
                          <div
                            className={`${baseStyle} ${
                              data.userId === userId
                                ? 'bg-green-300 rounded-bl-2xl'
                                : 'bg-gray-300 rounded-br-2xl'
                            }`}
                          >
                            {data.message}
                          </div>
                          {data.userId !== userId && (
                            <div className="text-sm mr-2 text-white">
                              {data.userId}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }
                })}
              </div>
              <div ref={messagesEndRef} />
            </div>
            <hr className="my-4 border-gray-300" />
            <div className="px-4 pb-4">
              <div className="flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 border rounded-lg p-2 mr-2"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-500 text-white rounded-lg p-2"
                >
                  <TbSend size={26} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div style={{ display: isFormVisible ? 'block' : 'none' }}>
          {showForm ? (
            <div className="absolute top-0 left-0 z-10 p-4 ml-16 mt-4 max-w-xl bg-white rounded shadow-lg">
              <Form
                userId={userId}
                roomId={roomId}
                onStationSelect={handleStationSelect}
                onSubmit={handleFormSubmit}
                queryStations={queryStations}
                getStationName={getStationName}
              />
            </div>
          ) : (
            <div className="absolute top-0 left-0 z-10 p-4 ml-16 mt-4 max-w-xl bg-white rounded shadow-lg max-h-[95%] overflow-y-auto">
              <Plan
                userId={userId}
                roomId={roomId}
                onStationSelect={handleStationSelect}
                onStationSelectRoutes={handleStationRoutesSelect}
                queryRestaurants={queryRestaurants}
                queryRoutes={queryRoutes}
                restaurantData={restaurantData}
                routesData={routesData}
                destStations={destStations}
                onBack={handleBackToForm}
                onRestaurantsSelect={handleRestaurantsSelect}
                onActiveRestaurantIndexChange={
                  handleActiveRestaurantIndexChange
                }
              />
            </div>
          )}
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
              position: google.maps.ControlPosition.TOP_RIGHT,
              style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
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
    </>
  )
}
