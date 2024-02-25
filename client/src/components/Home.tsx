import { useState, useEffect } from 'react'
import { Auth } from './Auth'
import { Map } from './Map'
import { Chat } from './Chat'

export const Home = () => {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [roomId, setRoomId] = useState('')
  const [isLogined, setIsLogined] = useState(false)

  return (
    <>
      <>
        {isLogined ? (
          <>
            <Chat
              roomId={roomId}
              setIsLogined={setIsLogined}
              ws={ws}
              setWs={setWs}
            />
            <Map setIsLogined={setIsLogined} ws={ws} setWs={setWs} />
          </>
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
