import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import { RoutesResponse, RoutesRequest } from '../types'

export type QueryRoutesProps = {}

export const useQueryRoutes = () => {
  const queryRoutes = useMutation<RoutesResponse, Error, RoutesRequest>(
    async (routesRequest: RoutesRequest) => {
      const response = await axios.post<RoutesResponse>(
        `${process.env.REACT_APP_API_URL}/routes`, // TODO: エンドポイントに合わせる
        routesRequest
      )

      return response.data
    }
  )

  return { queryRoutes }
}
