import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import { Credential } from '../types'
import { useError } from '../hooks/useError'

export type MutateAuthProps = {
  roomId: string
  setIsLogined: (state: boolean) => void
  ws: WebSocket | null
  setWs: (ws: WebSocket | null) => void
}

export const useMutateAuth = (props: MutateAuthProps) => {
  const { roomId, setIsLogined, ws, setWs } = props

  const { switchErrorHandling } = useError()
  const loginMutation = useMutation(
    async (user: Credential) =>
      await axios.post(
        `${process.env.REACT_APP_API_URL}/login?room_id=${
          roomId !== '' ? roomId : user.user_id
        }`,
        user
      ),
    {
      onSuccess: (data) => {
        setIsLogined(true)
        localStorage.setItem('token', data.data.token)
      },
      onError: (err: any) => {
        if (err.response.data.message) {
          switchErrorHandling(err.response.data.message)
        } else {
          switchErrorHandling(err.response.data)
        }
      },
    }
  )
  const registerMutation = useMutation(
    async (user: Credential) =>
      await axios.post(`${process.env.REACT_APP_API_URL}/signup`, user),
    {
      onError: (err: any) => {
        if (err.response.data.message) {
          switchErrorHandling(err.response.data.message)
        } else {
          switchErrorHandling(err.response.data)
        }
      },
    }
  )
  const logoutMutation = useMutation(
    async () => await axios.post(`${process.env.REACT_APP_API_URL}/logout`),
    {
      onSuccess: () => {
        if (ws) {
          const logoutMessage = JSON.stringify({
            type: 'logout',
            content: '',
          })
          ws.send(logoutMessage)
          ws.close(1000)
          setWs(null)
        }
        setIsLogined(false)
        localStorage.removeItem('token')
      },
      onError: (err: any) => {
        if (err.response.data.message) {
          switchErrorHandling(err.response.data.message)
        } else {
          switchErrorHandling(err.response.data)
        }
      },
    }
  )
  return { loginMutation, registerMutation, logoutMutation }
}
