import { useState } from 'react'
import { Auth } from './Auth'
import { Map } from './Map'

export const Home = () => {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [userId, setUserId] = useState('')
  const [roomId, setRoomId] = useState('')
  const [isLogined, setIsLogined] = useState(false)

  return (
    <>
      <>
        {isLogined ? (
          <Map
            userId={userId}
            roomId={roomId}
            setIsLogined={setIsLogined}
            ws={ws}
            setWs={setWs}
          />
        ) : (
          <Auth
            userId={userId}
            setUserId={setUserId}
            roomId={roomId}
            setRoomId={setRoomId}
            setIsLogined={setIsLogined}
          />
        )}
      </>
    </>
  )
}
