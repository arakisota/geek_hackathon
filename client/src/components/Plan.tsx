import React, { useEffect } from 'react'
import { RestaurantsRequest } from '../types'
import { useQueryRestaurants } from '../hooks/useQueryRestaurant'

type PlanProps = {
  restaurantsRequest: RestaurantsRequest | undefined
}

export const Plan: React.FC<PlanProps> = (props) => {
  const { restaurantsRequest } = props

  const { queryRestaurants } = useQueryRestaurants()

  useEffect(() => {
    if (restaurantsRequest?.stations !== undefined) {
      queryRestaurants.mutate(restaurantsRequest)
    }
    console.log(restaurantsRequest)
  }, [restaurantsRequest?.stations])
  return <div>Plan</div>
}
