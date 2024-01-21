import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import {
  StationsResponse,
  StationsRequest,
  SuggestionResponse,
  RestaurantsRequest,
  RoutesRequest,
} from '../types'

export type QueryStationsProps = {
  setRestaurantsRequest: (restaurantsRequest: RestaurantsRequest) => void
  setRoutesRequest: (routesRequest: RoutesRequest) => void
}

export const useQueryStations = (props: QueryStationsProps) => {
  const queryStations = useMutation<StationsResponse, Error, StationsRequest>(
    async (stationsRequest: StationsRequest) => {
      const response = await axios.post<StationsResponse>(
        `${process.env.REACT_APP_API_URL}/stations`,
        stationsRequest
      )

      const stationArray: string[] = Object.values(
        response.data as StationsResponse
      )
        .map((station) => station.replace(/駅$/, ''))
        .filter((station, index, self) => {
          return self.indexOf(station) === index
        })

      props.setRestaurantsRequest({
        stations: stationArray,
        people_num: stationsRequest.people_num,
        arrival_time: stationsRequest.arrival_time,
        purpose: stationsRequest.purpose,
      })

      props.setRoutesRequest({
        departure_stations: stationsRequest.departures.map((station) => station.replace(/駅$/, ''))
        .filter((station, index, self) => {
          return self.indexOf(station) === index
        }),
        destination_stations: stationArray,
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
