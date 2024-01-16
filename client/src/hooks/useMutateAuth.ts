import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import { Credential } from '../types'
import { useError } from '../hooks/useError'

export type MutateAuthProps = {
  setIsLogined: (state: boolean) => void
}

export const useMutateAuth = (props: MutateAuthProps) => {
  const { setIsLogined } = props

  const { switchErrorHandling } = useError()
  const loginMutation = useMutation(
    async (user: Credential) =>
      await axios.post(`${process.env.REACT_APP_API_URL}/login`, user),
    {
      onSuccess: () => {
        setIsLogined(true)
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
        setIsLogined(false)
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
