import { FC, useState, FormEvent } from 'react'
import {
  ArrowRightOnRectangleIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/solid'
import { useMutateAuth, MutateAuthProps } from '../hooks/useMutateAuth'

export type AuthProps = {
  setIsLogined: (state: boolean) => void
}

export const Auth: FC<AuthProps> = (props) => {
  const { setIsLogined } = props

  const [userId, setUserId] = useState('')
  const [pw, setPw] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const { loginMutation, registerMutation } = useMutateAuth({
    setIsLogined,
  } as MutateAuthProps)

  const submitAuthHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLogin) {
      loginMutation.mutate({
        user_id: userId,
        password: pw,
      })
    } else {
      await registerMutation
        .mutateAsync({
          user_id: userId,
          password: pw,
        })
        .then(() =>
          loginMutation.mutate({
            user_id: userId,
            password: pw,
          })
        )
    }
  }
  return (
    <div className="flex justify-center items-center flex-col min-h-screen text-gray-600 font-mono">
      <div className="flex items-center">
        <CheckBadgeIcon className="h-8 w-8 mr-2 text-blue-500" />

        <span className="text-center text-3xl font-extrabold">Home</span>
      </div>

      <h2 className="my-6">{isLogin ? 'Login' : 'Create a new account'}</h2>
      <form onSubmit={submitAuthHandler}>
        <div>
          <input
            className="mb-3 px-3 text-sm py-2 border border-gray-300"
            name="user_id"
            type="user_id"
            autoFocus
            placeholder="UserID"
            onChange={(e) => setUserId(e.target.value)}
            value={userId}
          />
        </div>
        <div>
          <input
            className="mb-3 px-3 text-sm py-2 border border-gray-300"
            name="password"
            type="password"
            placeholder="Password"
            onChange={(e) => setPw(e.target.value)}
            value={pw}
          />
        </div>
        <div className="flex justify-center my-2">
          <button
            className="disabled:opacity-40 py-2 px-4 rounded text-white bg-indigo-600"
            disabled={!userId || !pw}
            type="submit"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </div>
      </form>
      <ArrowPathIcon
        onClick={() => setIsLogin(!isLogin)}
        className="h-6 w-6 my-2 text-blue-500 cursor-pointer"
      />
    </div>
  )
}
