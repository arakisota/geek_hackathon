import { useState } from 'react'
import { Auth } from './Auth'
import { Map } from './Map'
import { Chat } from './Chat'

export const Home = () => {
  const [roomId, setRoomId] = useState('')
  const [isLogined, setIsLogined] = useState(false)

  return (
    <>
      <>
        {isLogined ? (
          <>
            <Chat roomId={roomId} />
            <Map setIsLogined={setIsLogined} />
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
