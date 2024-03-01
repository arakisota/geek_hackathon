import { useEffect } from 'react'
import axios from 'axios'
import { CsrfToken } from './types'
import { Home } from './components/Home'

function App() {
  useEffect(() => {
    axios.defaults.withCredentials = true
    // eslint-disable-next-line
    const getCsrfToken = async () => {
      const { data } = await axios.get<CsrfToken>(
        `${process.env.REACT_APP_API_URL}/csrf`
      )
      axios.defaults.headers.common['X-CSRF-Token'] = data.csrf_token
    }
    // getCsrfToken()
  }, [])
  return <Home />
}

export default App
