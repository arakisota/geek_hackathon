import { useState } from 'react'
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form'
import { useQueryStations } from '../hooks/useQueryStations'

type FormData = {
  stations: { station: string }[]
}

export const Form = () => {
  // eslint-disable-next-line
  const { mutate, data, error, isLoading } = useQueryStations()

  const { register, handleSubmit, control } = useForm<FormData>({
    defaultValues: {
      stations: [{ station: '' }],
    },
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
    }
  }

  const submitStationsHandler: SubmitHandler<FormData> = async (formData) => {
    console.log(formData)
    const departures = formData.stations
      .map((item) => item.station)
      .filter((station) => station !== '')
    mutate({ departures })
  }

  return (
    <div className="flex justify-center items-center flex-col min-h-screen text-gray-600 font-mono">
      <h2 className="my-6">入力フォーム</h2>
      <form onSubmit={handleSubmit(submitStationsHandler)}>
        {fields.map((field, index) => (
          <div key={field.id}>
            <label htmlFor={`stations.${index}.station`}>
              <input
                className="mb-3 px-3 text-sm py-2 border border-gray-300"
                autoFocus
                placeholder={`駅名${index + 1}`}
                {...register(`stations.${index}.station`)}
              />
            </label>
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
            className="disabled:opacity-40 py-2 px-4 rounded text-white bg-indigo-600"
            type="submit"
          >
            送信
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
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul className="my-5">
          <li key="fastest">最速の駅: {data?.fastest_station}</li>
          <li key="fewest">最少乗換えの駅: {data?.fewest_transfer_station}</li>
          <li key="cheapest">最安値の駅: {data?.cheapest_station}</li>
        </ul>
      )}
    </div>
  )
}
