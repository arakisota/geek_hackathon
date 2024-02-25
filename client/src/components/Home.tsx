import { useState } from 'react'
import { Auth } from './Auth'
import { Map } from './Map'

export const Home = () => {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [roomId, setRoomId] = useState('')
  const [isLogined, setIsLogined] = useState(false)

  return (
    <>
      <>
        {isLogined ? (
          <Map
            roomId={roomId}
            setIsLogined={setIsLogined}
            ws={ws}
            setWs={setWs}
          />
        ) : (
          <Auth
            roomId={roomId}
            setRoomId={setRoomId}
            setIsLogined={setIsLogined}
          />
        )}
      </>
    </>
  )
}
