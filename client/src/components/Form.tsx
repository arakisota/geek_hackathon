import { useState } from 'react'
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form'
import { useQueryStations } from '../hooks/useQueryStations'
import { debounce } from 'lodash'
import {
  StationRead,
  LatLng,
  RestaurantsRequest,
  RoutesRequest,
} from '../types'
import { QueryStationsProps } from '../hooks/useQueryStations'

type FormData = {
  stations: { station: string }[]
  people_num: number
  arrival_time: string
  purpose: string
}

type FormProps = {
  onStationSelect: (positions: LatLng[]) => void
  setRestaurantsRequest: (restaurantsRequest: RestaurantsRequest) => void
  setRoutesRequest: (routesRequest: RoutesRequest) => void
  onSubmit: () => void
}

export const Form: React.FC<FormProps> = (props) => {
  const { onStationSelect, setRestaurantsRequest, setRoutesRequest, onSubmit } =
    props

  const { queryStations, getStationName } = useQueryStations({
    setRestaurantsRequest,
    setRoutesRequest,
  } as QueryStationsProps)

  // eslint-disable-next-line
  const { data, isLoading, error, mutate } = queryStations

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { isValid },
  } = useForm<FormData>({
    defaultValues: {
      stations: [{ station: '' }],
      people_num: 1,
      arrival_time: '',
      purpose: '',
    },
    mode: 'onChange',
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'stations',
  })
  const [count, setCount] = useState(0)
  const countUp = () => setCount(count + 1)
  const reduce = () => {
    if (count > 0) {
      remove(count)
      setCount(count - 1)

      const newPositions = [...positions].slice(0, -1)
      setPositions(newPositions)
      onStationSelect(newPositions)
    }
  }

  const [showForm, setShowForm] = useState(true)

  const submitStationsHandler: SubmitHandler<FormData> = async (formData) => {
    const arrival_time: Date = new Date(formData.arrival_time)
    const arrival_time_ISO8601: string = arrival_time.toISOString()
    const requestData = {
      departures: formData.stations
        .map((item) => {
          let stationName = item.station
          stationName = stationName.replace(/\(.*?\)/, '駅')
          if (!stationName.endsWith('駅')) {
            stationName += '駅'
          }
          return stationName
        })
        .filter((station, index, self) => {
          return station !== '駅' && self.indexOf(station) === index
        }),
      people_num: formData.people_num,
      arrival_time: arrival_time_ISO8601,
      purpose: formData.purpose,
    }
    mutate(requestData)
    setShowForm(false)
    onStationSelect([])
    onSubmit()
  }

  const [suggestions, setSuggestions] = useState<StationRead[][]>([])
  const [positions, setPositions] = useState<LatLng[]>([])

  const fetchSuggestions = async (index: number, value: string) => {
    if (value.length > 0) {
      try {
        const response = await getStationName(value)
        const newSuggestions = [...suggestions]
        newSuggestions[index] = response.stations
        setSuggestions(newSuggestions)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      }
    } else {
      const newSuggestions = [...suggestions]
      newSuggestions[index] = []
      setSuggestions(newSuggestions)
    }
  }

  // 関数をdebounceする
  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300)

  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    setValue(`stations.${index}.station`, value)
    debouncedFetchSuggestions(index, value)
  }

  const handleSuggestionClick = (index: number, suggestion: StationRead) => {
    setValue(`stations.${index}.station`, suggestion.Name)
    const newSuggestions = [...suggestions]
    newSuggestions[index] = []
    setSuggestions(newSuggestions)

    const newPositions = [...positions]
    newPositions[index] = {
      lat: suggestion.Latitude,
      lng: suggestion.Longitude,
    }
    setPositions(newPositions)
    onStationSelect(newPositions)
  }

  console.log()

  const peopleOptions = []
  for (let i = 1; i <= 50; i++) {
    peopleOptions.push(
      <option key={i} value={i}>
        {i}人
      </option>
    )
  }

  // データ表示
  if (!showForm && data) {
    return (
      <div className="flex items-center flex-col text-gray-600 font-mono">
        <ul className="my-5">
          <li key="fastest">最速の駅: {data.fastest_station}</li>
          <li key="fewest">最少乗換えの駅: {data.fewest_transfer_station}</li>
          <li key="cheapest">最安値の駅: {data.cheapest_station}</li>
        </ul>
        <button
          onClick={() => setShowForm(true)}
          className="py-2 px-4 rounded text-white bg-indigo-600"
        >
          フォームに戻る
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center flex-col text-gray-600 font-mono">
      {/* <h2 className="my-6">入力フォーム</h2> */}
      <form
        onSubmit={handleSubmit(submitStationsHandler)}
        className="w-full max-w-md"
      >
        {/* 人数入力項目 */}
        <div className="flex mb-4 items-center">
          <label className="w-1/3" htmlFor="people_num">
            人数:
          </label>
          <select
            {...register('people_num', { required: '人数を選択してください' })}
            className="flex-1 px-3 py-2 border border-gray-300"
            id="people_num"
          >
            <option value="">人数を選択してください</option>
            {peopleOptions}
          </select>
        </div>

        {/* 日時選択項目 */}
        <div className="flex mb-4 items-center">
          <label className="w-1/5" htmlFor="arrival_time">
            日時:
          </label>
          <input
            type="datetime-local"
            {...register('arrival_time', {
              required: '日時を入力してください',
            })}
            className="flex-1 px-3 py-2 border border-gray-300"
            id="arrival_time"
            placeholder="日時を入力してください"
          />
        </div>

        {/* 目的選択項目 */}
        <div className="flex mb-4 items-center">
          <label className="w-1/3" htmlFor="purpose">
            目的:
          </label>
          <select
            {...register('purpose', { required: '目的を選択してください' })}
            className="flex-1 px-3 py-2 border border-gray-300"
            id="purpose"
          >
            <option value="">目的を選択してください</option>
            <option value="meal">食事</option>
            <option value="drinking">飲み会</option>
            <option value="date">デート</option>
            <option value="family">家族</option>
            <option value="cafe">カフェ</option>
          </select>
        </div>

        <hr className="my-4 border-gray-300" />

        {/* 駅名入力項目 */}
        {fields.map((field, index) => (
          <div className="flex mb-4 items-start" key={field.id}>
            <label className="w-1/5 pt-2" htmlFor={`station${index}`}>
              駅名{index + 1}:
            </label>
            <div className="flex-1 relative">
              <input
                className="w-full px-3 py-2 border border-gray-300"
                placeholder="駅名を入力してください"
                {...register(`stations.${index}.station`, {
                  onChange: (e) => handleInputChange(index, e),
                  required: '駅名を入力してください',
                })}
                id={`station${index}`}
              />
              {suggestions[index] && suggestions[index].length > 0 && (
                <div className="absolute left-full top-0 ml-2 z-10 w-52 bg-white border border-gray-300 max-h-40 overflow-auto">
                  {suggestions[index].map((suggestion, sIndex) => (
                    <div
                      key={sIndex}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex flex-col"
                      onClick={() => handleSuggestionClick(index, suggestion)}
                    >
                      <span className="font-medium">{suggestion.Name}</span>
                      <span className="text-xs text-gray-600">
                        {suggestion.Yomi}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="flex justify-center my-2 gap-2">
          <button
            type="button"
            className="disabled:opacity-40 py-2 px-4 rounded text-white bg-indigo-600"
            onClick={() => [append({ station: '' }), countUp()]}
          >
            +
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className={`py-2 px-4 rounded text-white ${
              isValid ? 'bg-indigo-600' : 'bg-gray-400'
            }`}
          >
            目的地を探す
          </button>
          <button
            type="button"
            className="disabled:opacity-40 py-2 px-4 rounded text-white bg-indigo-600"
            onClick={reduce}
          >
            -
          </button>
        </div>
      </form>
    </div>
  )
}
