import React, { useState, useEffect, useRef } from 'react'
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api'
import { LatLng, RestaurantsResponse, RoutesResponse, Stations } from '../types'
import { mapStyle } from '../types/mapStyle'
import { Appbar } from './Appbar'
import { Chat } from './Chat'
import { Form } from './Form'
import { Plan } from './Plan'
import { useQueryStations, QueryStationsProps } from '../hooks/useQueryStations'
import { useMutateAuth, MutateAuthProps } from '../hooks/useMutateAuth'

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
  const [isChatVisible, setIsChatVisible] = useState<boolean>(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  useEffect(() => {
    const websocket = new WebSocket(
      `${process.env.REACT_APP_WEBSOCKET_URL}?token=${token}&room_id=${roomId}`
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
          if (data.userId === roomId) {
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
    // eslint-disable-next-line
  }, [])

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
        if (
          stationPosition &&
          'lat' in stationPosition &&
          'lng' in stationPosition
        ) {
          bounds.extend(stationPosition)
        } else {
          bounds.extend(defaultCenter)
        }
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

  return (
    <>
      {/* アプリケーションバー */}
      <Appbar
        isFormVisible={isFormVisible}
        setIsFormVisible={setIsFormVisible}
        isChatVisible={isChatVisible}
        setIsChatVisible={setIsChatVisible}
        hasNewMessage={hasNewMessage}
        setHasNewMessage={setHasNewMessage}
        logout={logout}
      />

      {/* チャット */}
      <Chat
        userId={userId}
        roomId={roomId}
        isChatVisible={isChatVisible}
        messages={messages}
        setHasNewMessage={setHasNewMessage}
        ws={ws}
      />

      {/* フォーム・お店の表示 */}
      <div className="relative">
        <div style={{ display: isFormVisible ? 'block' : 'none' }}>
          {showForm ? (
            <div className="absolute top-16 md:top-4 left-0 z-10 p-4 md:ml-16 w-full md:max-w-xs bg-white rounded shadow-lg max-h-[40vh] md:max-h-[95vh] overflow-y-auto md:animate-slide-in-left animate-slide-in-top">
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
            <div className="absolute top-16 md:top-4 left-0 z-10 md:ml-16 w-full md:max-w-lg bg-white rounded shadow-lg max-h-[40vh] md:max-h-[95vh] overflow-y-auto md:animate-slide-in-left animate-slide-in-top">
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

        {/* GoogleMap */}
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
