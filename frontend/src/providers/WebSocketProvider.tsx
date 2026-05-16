'use client'

import { ORDER_WS_URL, TokenType, USE_WEBSOCKET, VENDOR_WS_URL } from '@/lib/constants'
import { Client } from '@stomp/stompjs'
import { getCookie } from 'cookies-next'
import { createContext, useContext, useEffect, useState } from 'react'
import SockJS from 'sockjs-client'
import { useAuth } from './AuthProvider'

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
  const { user, isLoading: isUserLoading} = useAuth();
  const [orderClient, setOrderClient] = useState<Client | null>(null)
  const [vendorClient, setVendorClient] = useState<Client | null>(null)
  const [isOrderConnected, setIsOrderConnected] = useState(false)
  const [isVendorConnected, setIsVendorConnected] = useState(false)

  useEffect(() => {
    if (!USE_WEBSOCKET) return

    const token = getCookie(TokenType.authToken)
    if (isUserLoading || !user || !token) return

    const orderWebsocketUrl = ORDER_WS_URL
    const vendorWebsocketUrl = VENDOR_WS_URL
    if (!orderWebsocketUrl || !vendorWebsocketUrl) return

    const userRole = user.role // Giả sử mỗi user chỉ có 1 role chính
    let oClient: Client | null = null
    let vClient: Client | null = null

    if (userRole === 'CUSTOMER') {
      oClient = new Client({
        webSocketFactory: () => new SockJS(orderWebsocketUrl),
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        // debug: (str) => console.log('[Order STOMP]', str),
      })

      oClient.onConnect = () => setIsOrderConnected(true)
      oClient.onWebSocketClose = () => setIsOrderConnected(false)
      oClient.activate()
      setOrderClient(oClient)

    } else if (userRole === 'MANAGER' || userRole === 'STAFF') {
      vClient = new Client({
        webSocketFactory: () => new SockJS(vendorWebsocketUrl),
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        // debug: (str) => console.log('[Vendor STOMP]', str),
      })

      vClient.onConnect = () => setIsVendorConnected(true)
      vClient.onWebSocketClose = () => setIsVendorConnected(false)
      vClient.activate()
      setVendorClient(vClient)
    }

    // 5. Cleanup function
    return () => {
      if (oClient) {
        oClient.deactivate()
        setOrderClient(null)
        setIsOrderConnected(false)
      }
      if (vClient) {
        vClient.deactivate()
        setVendorClient(null)
        setIsVendorConnected(false)
      }
    }
  }, [user, isUserLoading])

  // Audio Unlock mechanism for notification sounds
  useEffect(() => {
    const unlockAudio = () => {
      const audio = new Audio('/assets/sounds/notification.mp3')
      audio.volume = 0
      audio.play()
        .then(() => {
          console.log('Audio unlocked for notifications')
          window.removeEventListener('click', unlockAudio)
          window.removeEventListener('keydown', unlockAudio)
          window.removeEventListener('touchstart', unlockAudio)
        })
        .catch((err) => {
          console.log('Audio unlock failed, waiting for interaction...', err)
        })
    }

    window.addEventListener('click', unlockAudio)
    window.addEventListener('keydown', unlockAudio)
    window.addEventListener('touchstart', unlockAudio)

    return () => {
      window.removeEventListener('click', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
      window.removeEventListener('touchstart', unlockAudio)
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