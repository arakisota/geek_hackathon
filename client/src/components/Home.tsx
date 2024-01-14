import { useState } from 'react'
import { Auth } from './Auth'

export const Home = () => {
  const [isLogined, setIsLogined] = useState(false)

  return <Auth isLogined={isLogined} setIsLogined={setIsLogined} />
}
