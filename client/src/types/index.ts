export type CsrfToken = {
  csrf_token: string
}
export type Credential = {
  user_id: string
  password: string
}
export type StationsRequest = {
  departures: string[]
}
export type StationsResponse = {
  fastest_station: string
  fewest_transfer_station: string
  cheapest_station: string
}
