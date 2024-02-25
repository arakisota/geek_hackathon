import React, { useState, useEffect } from 'react'
import { useMutateAuth, MutateAuthProps } from '../hooks/useMutateAuth'

export type ChatProps = {
  roomId: string
  setIsLogined: (state: boolean) => void
  ws: WebSocket | null
  setWs: (ws: WebSocket | null) => void
}

export const Chat: React.FC<ChatProps> = (props: ChatProps) => {
  const { roomId, setIsLogined, ws, setWs } = props

  const token = localStorage.getItem('token')
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState('')

  const { logoutMutation } = useMutateAuth({
    roomId,
    setIsLogined,
    ws,
    setWs,
  } as MutateAuthProps)

  useEffect(() => {
    const websocket = new WebSocket(
      `ws://localhost:8080/ws?token=${token}&room_id=${roomId}`
    )

    websocket.onopen = () => {
      const loginMessage = JSON.stringify({
        type: 'login',
        content: '',
      })
      websocket.send(loginMessage)
    }

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'login':
          setMessages((prev) => [...prev, event.data])
          break

        case 'logout':
          if (data.userId == roomId) {
            alert('Host logout!')
            logoutMutation.mutateAsync()
            break
          }
          setMessages((prev) => [...prev, event.data])
          break

        case 'message':
          setMessages((prev) => [...prev, event.data])
          break

        default:
          console.log('Unknown message type:', data.type)
      }
    }
    setWs(websocket)

    return () => {
      websocket.onopen = null
      websocket.onmessage = null
      //   websocket.close();
    }
  }, [])

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

  return (
    <div className="p-4">
      <div className="mb-4">
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="border p-2 mr-2"
      />
      <button onClick={sendMessage} className="bg-blue-500 text-white p-2">
        Send
      </button>
    </div>
  )
}
