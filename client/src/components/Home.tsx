import { useState } from 'react'
import { Auth } from './Auth'
import { Map } from './Map'

export const Home = () => {
  const [isLogined, setIsLogined] = useState(false)

  return (
    <>
      <>
        {isLogined ? (
          <Map setIsLogined={setIsLogined} />
        ) : (
          <Auth setIsLogined={setIsLogined} />
        )}
      </>
    </>
  )
}
