'use client'

import { ORDER_WS_URL, TokenType, USE_WEBSOCKET, VENDOR_WS_URL } from '@/lib/constants'
import { Client } from '@stomp/stompjs'
import { getCookie } from 'cookies-next'
import { createContext, useContext, useEffect, useState } from 'react'
import SockJS from 'sockjs-client'

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

    // 1. Order Service WebSocket dùng SockJS
    const oClient = new Client({
      // Dùng webSocketFactory thay vì brokerURL
      webSocketFactory: () => new SockJS(ORDER_WS_URL || ''),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log('[Order STOMP]', str),
    })

    oClient.onConnect = () => {
      console.log('Connected to Order WebSocket')
      setIsOrderConnected(true)

      // Bạn có thể test subscribe tại đây nếu cần thiết
      // oClient.subscribe(`/topic/customer/${CUSTOMER_ID}`, (msg) => { ... })
    }
    oClient.onWebSocketClose = () => setIsOrderConnected(false)
    oClient.activate()
    setOrderClient(oClient)

    // 2. Vendor Service WebSocket dùng SockJS
    const vClient = new Client({
      webSocketFactory: () => new SockJS(VENDOR_WS_URL || ''),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log('[Vendor STOMP]', str),
    })

    vClient.onConnect = () => {
      console.log('Connected to Vendor WebSocket')
      setIsVendorConnected(true)

      // vClient.subscribe(`/topic/vendor/${VENDOR_ID}`, (msg) => { ... })
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