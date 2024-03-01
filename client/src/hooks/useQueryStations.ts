import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import { StationsResponse, StationsRequest, SuggestionResponse } from '../types'
import {
  useQueryRestaurants,
  QueryRestaurantsProps,
} from './useQueryRestaurant'
import { useQueryRoutes, QueryRoutesProps } from './useQueryRoutes'

export type QueryStationsProps = {
  roomId: string
}

export const useQueryStations = (props: QueryStationsProps) => {
  const { roomId } = props

  const { queryRestaurants } = useQueryRestaurants({
    roomId,
  } as QueryRestaurantsProps)
  const { queryRoutes } = useQueryRoutes({
    roomId,
  } as QueryRoutesProps)

  const queryStations = useMutation<StationsResponse, Error, StationsRequest>(
    async (stationsRequest: StationsRequest) => {
      const response = await axios.post<StationsResponse>(
        `http${process.env.REACT_APP_API_URL}/stations?room_id=${roomId}`,
        stationsRequest
      )

      const stationArray: string[] = Object.values(
        response.data as StationsResponse
      )
        .map((station) => station.replace(/駅$/, ''))
        .filter((station, index, self) => {
          return self.indexOf(station) === index
        })

      queryRestaurants.mutate({
        stations: stationArray,
        people_num: stationsRequest.people_num,
        arrival_time: stationsRequest.arrival_time,
        purpose: stationsRequest.purpose,
      })

      queryRoutes.mutate({
        departure_stations: stationsRequest.departures
          .map((station) => station.replace(/駅$/, ''))
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
      `http${process.env.REACT_APP_API_URL}/suggest`,
      { params: { input } }
    )
    return response.data
  }
  return { queryStations, getStationName, queryRestaurants, queryRoutes }
}
