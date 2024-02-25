import React, { useState, useEffect, useRef } from 'react'
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api'
import {
  LatLng,
  RestaurantsRequest,
  RestaurantsResponse,
  RoutesRequest,
  RoutesResponse,
  Stations,
} from '../types'
import { mapStyle } from '../types/mapStyle'
import { Form } from './Form'
import { Plan } from './Plan'
import { useMutateAuth, MutateAuthProps } from '../hooks/useMutateAuth'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'

type MapProps = {
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
  const { roomId, setIsLogined, ws, setWs } = props
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
            alert('Host logout!')
            logout()
            break
          }
          setMessages((prev) => [...prev, event.data])
          break

        case 'message':
          setMessages((prev) => [...prev, event.data])
          break

        case 'restaurants':
          setRestaurantData(data.stations)
          handleFormSubmit()
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

  // -------------------------- Form --------------------------
  // フォーム上の操作、表示
  const [isFormVisible, setIsFormVisible] = useState(true)
  const toggleFormVisibility = () => setIsFormVisible(!isFormVisible)
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

  // -------------------------- Requests --------------------------
  // '/restaurants'と'/routes'エンドポイントでPOSTするリクエストの情報
  const [restaurantsRequest, setRestaurantsRequest] =
    useState<RestaurantsRequest>()
  const [routesRequest, setRoutesRequest] = useState<RoutesRequest>()

  return (
    <>
      <div className="p-4">
        <div className="mb-4">
          {messages.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border p-2 mr-2"
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white p-2">
          Send
        </button>
      </div>
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
                roomId={roomId}
                onStationSelect={handleStationSelect}
                onStationSelectRoutes={handleStationRoutesSelect}
                restaurantsRequest={restaurantsRequest}
                restaurantData={restaurantData}
                routesRequest={routesRequest}
                routesData={routesData}
                destStations={destStations}
                onBack={handleBackToForm}
                onRestaurantsSelect={handleRestaurantsSelect}
                onActiveRestaurantIndexChange={
                  handleActiveRestaurantIndexChange
                }
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
    </>
  )
}
