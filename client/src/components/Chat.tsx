import React, { useState, useEffect, useRef } from 'react'
import { FaAnglesLeft, FaAnglesRight } from 'react-icons/fa6'
import { TbSend } from 'react-icons/tb'

export type ChatProps = {
  userId: string
  roomId: string
  isChatVisible: boolean
  messages: string[]
  setHasNewMessage: (state: boolean) => void
  ws: WebSocket | null
}

export const Chat: React.FC<ChatProps> = (props: ChatProps) => {
  const { userId, roomId, isChatVisible, messages, setHasNewMessage, ws } =
    props

  const [input, setInput] = useState('')
  const sendMessage = () => {
    if (ws && input.trim()) {
      const chatMessage = JSON.stringify({
        type: 'message',
        content: input,
      })
      ws.send(chatMessage)
      setInput('')
    }
  }

  const [chatPositionLeft, setChatPositionLeft] = useState<boolean>(true)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  useEffect(() => {
    scrollToBottom()
    if (!isChatVisible) setHasNewMessage(true)
    // eslint-disable-next-line
  }, [messages])

  // -------------------------- Convert --------------------------
  const convertPurpose = (purpose: string) => {
    if (purpose === 'meal') return '食事'
    if (purpose === 'drinking') return '飲み会'
    if (purpose === 'date') return 'デート'
    if (purpose === 'family') return '家族'
    if (purpose === 'cafe') return 'カフェ'
    return ''
  }

  return (
    <div style={{ display: isChatVisible ? 'block' : 'none' }}>
      <div
        className={`fixed top-16 md:top-0 bottom-0 bg-black bg-opacity-50 w-full max-w-lg flex justify-center p-4 z-20 overflow-hidden ${
          chatPositionLeft ? 'md:ml-16 left-0' : 'right-0'
        }`}
      >
        <div className="w-full flex flex-col">
          <div className="w-full flex justify-between items-center">
            <FaAnglesLeft
              onClick={() => setChatPositionLeft(true)}
              className={`${
                chatPositionLeft
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-white cursor-pointer'
              } hidden md:flex`}
            />
            <div className="text-white text-sm">
              ホストのUserID / RoomID : {roomId}
            </div>
            <FaAnglesRight
              onClick={() => setChatPositionLeft(false)}
              className={`${
                !chatPositionLeft
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-white cursor-pointer'
              } hidden md:flex`}
            />
          </div>
          <hr className="my-4 border-gray-300" />
          <div className="p-4 flex-1 overflow-auto">
            <div className="space-y-2 w-full">
              {
                // eslint-disable-next-line
                messages.map((message, index) => {
                  const data = JSON.parse(message)
                  let baseStyle =
                    'px-4 py-2 rounded-t-2xl break-words w-fit overflow-wrap: break-word'
                  let justifyContent =
                    data.userId === userId ? 'justify-end' : 'justify-start'

                  if (data.type === 'login' || data.type === 'logout') {
                    return (
                      <div
                        key={index}
                        className="text-center text-white text-sm"
                      >
                        {data.message}
                      </div>
                    )
                  } else if (data.type === 'restaurants') {
                    return (
                      <div
                        key={index}
                        className="text-center text-white text-sm"
                      >
                        <div>
                          --- ホストが以下の内容でフォームを送信しました ---
                        </div>
                        <div>人数 : {data.requests.people_num}人</div>
                        <div>
                          日時 :{' '}
                          {data.requests.arrival_time
                            .replaceAll('-', '/')
                            .replace('T', ' ')
                            .replace('Z', '')
                            .replace(':00', '')}
                        </div>
                        <div>
                          目的 : {convertPurpose(data.requests.purpose)}
                        </div>
                        <div className="flex justify-center overflow-wrap: break-word">
                          出発駅 :{' '}
                          {data.departures
                            .map((station: string) => station.replace('駅', ''))
                            .join(', ')}
                        </div>
                        <div>
                          -----------------------------------------------------
                        </div>
                      </div>
                    )
                  } else if (data.type === 'message') {
                    return (
                      <div key={index} className={`flex ${justifyContent}`}>
                        <div>
                          <div
                            className={`${baseStyle} ${
                              data.userId === userId
                                ? 'bg-green-300 rounded-bl-2xl'
                                : 'bg-gray-300 rounded-br-2xl'
                            }`}
                          >
                            {data.message}
                          </div>
                          {data.userId !== userId && (
                            <div className="text-sm mr-2 text-white">
                              {data.userId}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }
                })
              }
            </div>
            <div ref={messagesEndRef} />
          </div>
          <hr className="my-4 border-gray-300" />
          <div className="px-4 pb-4">
            <div className="flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border rounded-lg p-2 mr-2"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white rounded-lg p-2"
              >
                <TbSend size={26} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
