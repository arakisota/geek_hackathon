import { useState } from 'react'
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form'
import { UseMutationResult } from '@tanstack/react-query'
import { debounce } from 'lodash'
import {
  StationRead,
  LatLng,
  StationsResponse,
  StationsRequest,
  SuggestionResponse,
} from '../types'
import { BsFillPeopleFill } from 'react-icons/bs'
import { BiSolidPurchaseTag } from 'react-icons/bi'
import { RiMapPinTimeLine } from 'react-icons/ri'
import { FaTrainSubway } from 'react-icons/fa6'

type FormData = {
  stations: { station: string }[]
  people_num: number
  arrival_time: string
  purpose: string
}

type FormProps = {
  userId: string
  roomId: string
  onStationSelect: (positions: LatLng[]) => void
  onSubmit: () => void
  queryStations: UseMutationResult<StationsResponse, Error, StationsRequest>
  getStationName: (input: string) => Promise<SuggestionResponse>
}

export const Form: React.FC<FormProps> = (props) => {
  const {
    userId,
    roomId,
    onStationSelect,
    onSubmit,
    queryStations,
    getStationName,
  } = props

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
      <form
        onSubmit={handleSubmit(submitStationsHandler)}
        className="w-full max-w-md"
      >
        <div className="flex mb-4 items-center">
          {/* 人数入力項目 */}
          <div className="flex flex-1 relative items-center mr-4">
            <BsFillPeopleFill
              className="absolute left-3 text-gray-400"
              size={20}
            />
            <select
              {...register('people_num', { required: '人数を選択する' })}
              className="flex-1 px-3 py-2 pl-10 border border-gray-300 appearance-none"
              id="people_num"
            >
              <option value="">人数を選択</option>
              {peopleOptions}
            </select>
          </div>

          {/* 目的選択項目 */}
          <div className="flex flex-1 relative items-center">
            <BiSolidPurchaseTag
              className="absolute left-3 text-gray-400"
              size={20}
            />
            <select
              {...register('purpose', { required: '目的を選択' })}
              className="flex-1 px-3 py-2 pl-10 border border-gray-300 appearance-none"
              id="purpose"
            >
              <option value="">目的を選択</option>
              <option value="meal">食事</option>
              <option value="drinking">飲み会</option>
              <option value="date">デート</option>
              <option value="family">家族</option>
              <option value="cafe">カフェ</option>
            </select>
          </div>
        </div>

        {/* 日時選択項目 */}
        <div className="flex mb-4 items-center relative">
          <RiMapPinTimeLine
            className="absolute left-3 text-gray-400"
            size={20}
          />
          <input
            type="datetime-local"
            {...register('arrival_time', {
              required: '日時を入力する',
            })}
            className="flex-1 px-3 py-2 pl-10 border border-gray-300 appearance-none"
            id="arrival_time"
            placeholder="日時を入力する"
          />
        </div>

        <hr className="my-4 border-gray-300" />

        {/* 駅名入力項目 */}
        {fields.map((field, index) => (
          <div className="flex mb-4 items-start" key={field.id}>
            <div className="flex-1 relative">
              <div className="relative w-full flex items-center">
                <FaTrainSubway
                  className="absolute left-3 text-gray-400"
                  size={20}
                />
                <input
                  className="w-full pl-11 px-3 py-2 border border-gray-300"
                  placeholder={`駅名${index + 1}`}
                  {...register(`stations.${index}.station`, {
                    onChange: (e) => handleInputChange(index, e),
                    required: `駅名${index + 1}`,
                  })}
                  id={`station${index}`}
                />
              </div>

              {suggestions[index] && suggestions[index].length > 0 && (
                <div className="absolute inset-x-0 z-10 w-full bg-white border border-gray-300 max-h-40 overflow-auto">
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
            disabled={!isValid || roomId !== userId}
            className={`py-2 px-4 rounded text-white ${
              isValid && roomId === userId ? 'bg-indigo-600' : 'bg-gray-400'
            }`}
          >
            集合地を探す
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
