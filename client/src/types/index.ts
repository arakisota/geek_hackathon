export type CsrfToken = {
  csrf_token: string
}
export type Credential = {
  user_id: string
  password: string
}
export type StationsRequest = {
  departures: string[]
  people_num: number
  arrival_time: string
  purpose: string
}
export type StationsResponse = {
  fastest_station: string
  fewest_transfer_station: string
  cheapest_station: string
}
export type StationRead = {
  Name: string
  Yomi: string
  Latitude: number
  Longitude: number
}
export type SuggestionResponse = {
  stations: StationRead[]
}
export type RestaurantsRequest = {
  stations: string[]
  people_num: number
  arrival_time: string
  purpose: string
}
export type RestaurantsResponse = {
  stations: StationRestaurant[]
}[]
export type StationRestaurant = {
  name: string
  address: string
  access: string
  lat: number
  lng: number
  budget: string
  open: string
  genre: Genre
  coupon_urls: string
}
export type Genre = {
  catch: string
  name: string
}
export type RestaurantInfo = {}
export type LatLng = {
  lat: number
  lng: number
}
