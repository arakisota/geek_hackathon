import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import { RestaurantsRequest, RestaurantsResponse } from '../types'

export type QueryRestaurantsProps = {
  roomId: string
}

export const useQueryRestaurants = (props: QueryRestaurantsProps) => {
  const { roomId } = props
  const queryRestaurants = useMutation<
    RestaurantsResponse,
    Error,
    RestaurantsRequest
  >(async (restaurantsRequest: RestaurantsRequest) => {
    restaurantsRequest.people_num = parseInt(
      restaurantsRequest.people_num.toString(),
      10
    )
    const response = await axios.post<RestaurantsResponse>(
      `http${process.env.REACT_APP_API_URL}/restaurants?room_id=${roomId}`,
      restaurantsRequest
    )
    return response.data
  })

  return { queryRestaurants }
}
