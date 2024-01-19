import { useState } from 'react'
import { Auth } from './Auth'
import { Form } from './Form'
import { Map } from './Map'

export const Home = () => {
  const [isLogined, setIsLogined] = useState(false)

  return (
    <>
      (
      <>
        <Auth isLogined={isLogined} setIsLogined={setIsLogined} />
        <Form />
      </>
      )
      <Map />
    </>
  )
}
