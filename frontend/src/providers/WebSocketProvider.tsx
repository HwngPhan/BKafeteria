'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getCookie } from 'cookies-next'
import { API_GATEWAY_BASE_URL, TokenType, USE_WEBSOCKET } from '@/lib/constants'

interface WebSocketContextType {
  orderClient: Client | null
  vendorClient: Client | null
  isOrderConnected: boolean
  isVendorConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextType>({
  orderClient: null,
  vendorClient: null,
  isOrderConnected: false,
  isVendorConnected: false,
})

export const useWebSocket = () => useContext(WebSocketContext)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [orderClient, setOrderClient] = useState<Client | null>(null)
  const [vendorClient, setVendorClient] = useState<Client | null>(null)
  const [isOrderConnected, setIsOrderConnected] = useState(false)
  const [isVendorConnected, setIsVendorConnected] = useState(false)

  useEffect(() => {
    if (!USE_WEBSOCKET) return

    const token = getCookie(TokenType.authToken)
    if (!token) return

    // 1. Order Service WebSocket
    const oClient = new Client({
      webSocketFactory: () => new SockJS(`${API_GATEWAY_BASE_URL}/order/ws`),
      // webSocketFactory: () => new SockJS(`https://api.bkafeteria.site/api/order/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    oClient.onConnect = () => {
      console.log('Connected to Order WebSocket')
      setIsOrderConnected(true)
    }
    oClient.onWebSocketClose = () => setIsOrderConnected(false)
    oClient.activate()
    setOrderClient(oClient)

    // 2. Vendor Service WebSocket
    const vClient = new Client({
      webSocketFactory: () => new SockJS(`${API_GATEWAY_BASE_URL}/vendor/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    vClient.onConnect = () => {
      console.log('Connected to Vendor WebSocket')
      setIsVendorConnected(true)
    }
    vClient.onWebSocketClose = () => setIsVendorConnected(false)
    vClient.activate()
    setVendorClient(vClient)

    return () => {
      oClient.deactivate()
      vClient.deactivate()
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ 
      orderClient, 
      vendorClient, 
      isOrderConnected, 
      isVendorConnected 
    }}>
      {children}
    </WebSocketContext.Provider>
  )
}
