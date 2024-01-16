import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import { StationsResponse, StationsRequest } from '../types'

export const useQueryStations = () => {
  const queryStations = useMutation<StationsResponse, Error, StationsRequest>(
    async (stationsRequest: StationsRequest) => {
      const response = await axios.post<StationsResponse>(
        `${process.env.REACT_APP_API_URL}/stations`,
        stationsRequest
      )
      return response.data
    }
  )
  return queryStations
}
