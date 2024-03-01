import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import { RoutesResponse, RoutesRequest } from '../types'

export type QueryRoutesProps = {
  roomId: string
}

export const useQueryRoutes = (props: QueryRoutesProps) => {
  const { roomId } = props
  const queryRoutes = useMutation<RoutesResponse, Error, RoutesRequest>(
    async (routesRequest: RoutesRequest) => {
      const response = await axios.post<RoutesResponse>(
        `${process.env.REACT_APP_API_URL}/routes?room_id=${roomId}`,
        routesRequest
      )
      return response.data
    }
  )

  return { queryRoutes }
}
