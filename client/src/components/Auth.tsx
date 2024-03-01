import { FC, useState, FormEvent } from 'react'
import { useMutateAuth, MutateAuthProps } from '../hooks/useMutateAuth'
import togatherLogo from '../assets/togather_logo_cream.png'
import { BiLogIn } from 'react-icons/bi'
import { LuFileSignature } from 'react-icons/lu'
import { MdOutlineRoomPreferences, MdOutlineMeetingRoom } from 'react-icons/md'

export type AuthProps = {
  userId: string
  setUserId: (userId: string) => void
  roomId: string
  setRoomId: (roomid: string) => void
  setIsLogined: (state: boolean) => void
}

export const Auth: FC<AuthProps> = (props: AuthProps) => {
  const { userId, setUserId, roomId, setRoomId, setIsLogined } = props

  const [pw, setPw] = useState('')
  const [activeTab, setActiveTab] = useState('createRoomLogin')
  const { loginMutation, registerMutation } = useMutateAuth({
    roomId,
    setIsLogined,
  } as MutateAuthProps)

  const isLogin =
    activeTab === 'createRoomLogin' || activeTab === 'joinRoomLogin'
  const isRoomCreation =
    activeTab === 'createRoomLogin' || activeTab === 'createAccountAndRoom'

  const submitAuthHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLogin) {
      loginMutation.mutate({
        user_id: userId,
        password: pw,
      })
    } else {
      await registerMutation
        .mutateAsync({ user_id: userId, password: pw })
        .then(() => {
          loginMutation.mutate({
            user_id: userId,
            password: pw,
          })
        })
    }
  }

  const tabDescriptions = (): string => {
    if (activeTab === 'createRoomLogin') return 'ログインして部屋を建てる'
    if (activeTab === 'joinRoomLogin') return 'ログインして部屋に参加する'
    if (activeTab === 'createAccountAndRoom')
      return 'アカウントを作成し、部屋を建てる'
    if (activeTab === 'createAccountAndJoin')
      return 'アカウントを作成し、部屋に参加する'
    return ''
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 font-mono text-gray-600">
      <div className="container mx-auto p-4">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:justify-start lg:gap-20">
          <img
            src={togatherLogo}
            alt="ToGather Logo"
            className="w-96 lg:w-1/2 h-auto"
          />
          <div className="max-w-md lg:w-1/2 bg-white shadow-lg rounded-lg p-8">
            <div className="tabs flex justify-between mb-4">
              <button
                className={`tab-button border-r border-gray-300 ${
                  activeTab === 'createRoomLogin' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('createRoomLogin')}
              >
                <div className="flex items-center justify-center px-2">
                  <BiLogIn size={30} />
                  <MdOutlineRoomPreferences size={30} />
                </div>
              </button>
              <button
                className={`tab-button border-r border-gray-300 ${
                  activeTab === 'joinRoomLogin' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('joinRoomLogin')}
              >
                <div className="flex items-center justify-center px-2">
                  <BiLogIn size={30} />
                  <MdOutlineMeetingRoom size={30} />
                </div>
              </button>
              <button
                className={`tab-button border-r border-gray-300 ${
                  activeTab === 'createAccountAndRoom' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('createAccountAndRoom')}
              >
                <div className="flex items-center justify-center px-2">
                  <LuFileSignature size={30} />
                  <MdOutlineRoomPreferences size={30} />
                </div>
              </button>
              <button
                className={`tab-button ${
                  activeTab === 'createAccountAndJoin' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('createAccountAndJoin')}
              >
                <div className="flex items-center justify-center px-2">
                  <LuFileSignature size={30} />
                  <MdOutlineMeetingRoom size={30} />
                </div>
              </button>
            </div>

            <form onSubmit={submitAuthHandler} className="space-y-4">
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                name="user_id"
                type="text"
                placeholder="UserID (ex. user)"
                onChange={(e) => setUserId(e.target.value)}
                value={userId}
              />
              {!isRoomCreation && (
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  name="room_id"
                  type="text"
                  placeholder="ホストのUserId/RoomID"
                  onChange={(e) => setRoomId(e.target.value)}
                  value={roomId}
                />
              )}
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                name="password"
                type="password"
                placeholder="Password"
                onChange={(e) => setPw(e.target.value)}
                value={pw}
              />
              <button
                className="w-full py-3 rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={!userId || !pw || (!isRoomCreation && !roomId)}
                type="submit"
              >
                {tabDescriptions()}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
