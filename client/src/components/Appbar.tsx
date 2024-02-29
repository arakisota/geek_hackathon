import { FaWpforms } from 'react-icons/fa'
import { MdOutlineChat, MdOutlineMarkUnreadChatAlt } from 'react-icons/md'
import { TbLogout } from 'react-icons/tb'
import togather from '../assets/toGather.png'

export type AppbarProps = {
  isFormVisible: boolean
  setIsFormVisible: (state: boolean) => void
  isChatVisible: boolean
  setIsChatVisible: (state: boolean) => void
  hasNewMessage: boolean
  setHasNewMessage: (state: boolean) => void
  logout: () => Promise<void>
}

export const Appbar: React.FC<AppbarProps> = (props: AppbarProps) => {
  const {
    isFormVisible,
    setIsFormVisible,
    isChatVisible,
    setIsChatVisible,
    hasNewMessage,
    setHasNewMessage,
    logout,
  } = props

  return (
    <>
      {/* ナビゲーションバー (スマホ) */}
      <div className="bg-gray-600 text-white fixed top-0 left-0 right-0 z-30 h-16 flex items-center justify-between md:hidden">
        {/* md:hidden で中サイズ以上では非表示 */}
        <img src={togather} className="w-12 h-10 ml-4" />
        <div className="flex gap-4 mr-4">
          <button
            className={`p-2 ${isFormVisible ? 'text-black bg-white' : ''}`}
            onClick={() => setIsFormVisible(!isFormVisible)}
          >
            <FaWpforms size={24} />
          </button>
          <button
            className={`p-2 ${isChatVisible ? 'bg-black bg-opacity-50' : ''}`}
            onClick={() => {
              if (!isChatVisible) setHasNewMessage(false)
              setIsChatVisible(!isChatVisible)
            }}
          >
            {hasNewMessage ? (
              <MdOutlineMarkUnreadChatAlt
                size={24}
                color={'rgb(255, 0, 255)'}
              />
            ) : (
              <MdOutlineChat size={24} />
            )}
          </button>
          <button className="p-2" onClick={logout}>
            <TbLogout size={24} />
          </button>
        </div>
      </div>

      {/* サイドバー (PC) */}
      <div className="fixed inset-0 w-16 z-30 hidden md:flex flex-col bg-gray-600">
        {/* md:flex で中サイズ以上で表示 */}
        <div className="w-16 h-16 flex items-center justify-center">
          <img src={togather} className="w-12 h-10" />
        </div>
        {/* フォーム表示ボタン */}
        <button
          className={`w-16 h-16 flex items-center justify-center ${
            isFormVisible ? 'text-black bg-white' : 'text-white'
          }`}
          onClick={() => setIsFormVisible(!isFormVisible)}
        >
          <FaWpforms size={24} />
        </button>
        {/* チャット表示ボタン */}
        <button
          className={`w-16 h-16 flex items-center justify-center text-white ${
            isChatVisible ? 'bg-black bg-opacity-50' : ''
          }`}
          onClick={() => {
            if (!isChatVisible) setHasNewMessage(false)
            setIsChatVisible(!isChatVisible)
          }}
        >
          {hasNewMessage ? (
            <MdOutlineMarkUnreadChatAlt size={24} color={'rgb(255, 0, 255)'} />
          ) : (
            <MdOutlineChat size={24} />
          )}
        </button>
        {/* ログアウトボタン */}
        <button
          className="w-16 h-16 rounded-full flex items-center justify-center text-white"
          onClick={logout}
        >
          <TbLogout size={24} />
        </button>
      </div>
    </>
  )
}
