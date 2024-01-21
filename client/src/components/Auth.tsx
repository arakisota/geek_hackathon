import { FC, useState, FormEvent } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import { useMutateAuth, MutateAuthProps } from '../hooks/useMutateAuth'
import togatherLogo from '../assets/togather_logo_cream.png'

export type AuthProps = {
  setIsLogined: (state: boolean) => void
}

export const Auth: FC<AuthProps> = ({ setIsLogined }) => {
  const [userId, setUserId] = useState('')
  const [pw, setPw] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const { loginMutation, registerMutation } = useMutateAuth({
    setIsLogined,
  } as MutateAuthProps)

  const submitAuthHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLogin) {
      loginMutation.mutate({ user_id: userId, password: pw })
    } else {
      await registerMutation
        .mutateAsync({ user_id: userId, password: pw })
        .then(() => loginMutation.mutate({ user_id: userId, password: pw }))
    }
  }

  return (
    <div
      className="flex justify-center items-center flex-col min-h-screen text-gray-600 font-mono "
      style={{ backgroundColor: '#F5F5F5' }}
    >
      <img src={togatherLogo} alt="ToGather Logo" width="800" height="800" />

      <h2 className="my-6 text-2xl">
        {isLogin ? 'Login' : 'Create a new account'}
      </h2>
      <form onSubmit={submitAuthHandler}>
        <div className="mb-4">
          <input
            className="mb-4 px-4 text-lg py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black-500 transition-all w-80"
            name="user_id"
            type="text"
            autoFocus
            placeholder="UserID"
            onChange={(e) => setUserId(e.target.value)}
            value={userId}
          />
        </div>
        <div className="mb-4">
          <input
            className="mb-4 px-4 text-lg py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black-500 transition-all w-80"
            name="password"
            type="password"
            placeholder="Password"
            onChange={(e) => setPw(e.target.value)}
            value={pw}
          />
        </div>
        <div className="flex justify-center my-4">
          <button
            className="disabled:opacity-40 disabled:cursor-not-allowed py-3 px-8 rounded text-lg text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={!userId || !pw}
            type="submit"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </div>
      </form>
      <ArrowPathIcon
        onClick={() => setIsLogin(!isLogin)}
        className="h-8 w-8 my-2 text-blue-500 cursor-pointer hover:text-blue-600 transition-all"
      />
    </div>
  )
}
