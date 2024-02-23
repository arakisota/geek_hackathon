import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import { RestaurantsRequest, RestaurantsResponse } from '../types'

export const useQueryRestaurants = () => {
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
      `${process.env.REACT_APP_API_URL}/restaurants`,
      restaurantsRequest
    )
    // console.log(response.data)
    return response.data
  })

  return { queryRestaurants }
}
