'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getCookie } from 'cookies-next'
import { API_GATEWAY_BASE_URL, TokenType } from '@/lib/constants'

interface WebSocketContextType {
  stompClient: Client | null
  isConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextType>({
  stompClient: null,
  isConnected: false,
})

export const useWebSocket = () => useContext(WebSocketContext)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [stompClient, setStompClient] = useState<Client | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const token = getCookie(TokenType.authToken)
    if (!token) return

    const client = new Client({
      // Depending on your gateway setup, you may need to adjust this URL.
      // Since sockjs uses standard HTTP to negotiate, we pass the HTTP URL.
      webSocketFactory: () => new SockJS(`${API_GATEWAY_BASE_URL}/order/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: function (str) {
        // console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    client.onConnect = (frame) => {
      setIsConnected(true)
      console.log('Connected to WebSocket')
    }

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message'])
      console.error('Additional details: ' + frame.body)
    }

    client.onWebSocketClose = () => {
      setIsConnected(false)
    }

    client.activate()
    setStompClient(client)

    return () => {
      client.deactivate()
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ stompClient, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  )
}
