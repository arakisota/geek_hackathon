// src/App.tsx
import React, { useState, useEffect } from 'react'

export type ChatProps = {
  roomId: string
}

export const Chat: React.FC<ChatProps> = ({ roomId }) => {
  const token = localStorage.getItem('token')
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState('')

  useEffect(() => {
    const websocket = new WebSocket(
      `ws://localhost:8080/ws?token=${token}&room_id=${roomId}`
    )
    websocket.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data])
    }
    setWs(websocket)

    return () => {
      websocket.onmessage = null
      //   websocket.close();
    }
  }, [])

  const sendMessage = () => {
    if (ws && input.trim()) {
      ws.send(input)
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
