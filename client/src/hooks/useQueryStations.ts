import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import {
  StationsResponse,
  StationsRequest,
  SuggestionResponse,
  RestaurantsRequest,
} from '../types'

export type QueryStationsProps = {
  setRestaurantsRequest: (restaurantsRequest: RestaurantsRequest) => void
}

export const useQueryStations = (props: QueryStationsProps) => {
  const queryStations = useMutation<StationsResponse, Error, StationsRequest>(
    async (stationsRequest: StationsRequest) => {
      const response = await axios.post<StationsResponse>(
        `${process.env.REACT_APP_API_URL}/stations`,
        stationsRequest
      )

      props.setRestaurantsRequest({
        ...stationsRequest,
        stations: Object.values(response.data as StationsResponse),
      })
      return response.data
    }
  )

  const getStationName = async (input: string) => {
    const response = await axios.get<SuggestionResponse>(
      `${process.env.REACT_APP_API_URL}/suggest`,
      { params: { input } }
    )
    return response.data
  }
  return { queryStations, getStationName }
}
