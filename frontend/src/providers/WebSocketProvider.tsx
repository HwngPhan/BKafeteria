"use client";

import {
  ORDER_WS_URL,
  TokenType,
  USE_WEBSOCKET,
  VENDOR_WS_URL,
} from "@/lib/constants";
import { Client } from "@stomp/stompjs";
import { getCookie } from "cookies-next";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { useAuth } from "./AuthProvider";

interface WebSocketContextType {
  orderClient: Client | null;
  vendorClient: Client | null;
  isOrderConnected: boolean;
  isVendorConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  orderClient: null,
  vendorClient: null,
  isOrderConnected: false,
  isVendorConnected: false,
});

export const useWebSocket = () => useContext(WebSocketContext);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isUserLoading } = useAuth();
  // State is set from async callbacks (onConnect/onWebSocketClose), never synchronously
  // in the effect body — avoids the react-hooks/set-state-in-effect rule.
  const [orderClient, setOrderClient] = useState<Client | null>(null);
  const [vendorClient, setVendorClient] = useState<Client | null>(null);
  const [isOrderConnected, setIsOrderConnected] = useState(false);
  const [isVendorConnected, setIsVendorConnected] = useState(false);
  // Refs hold the instances only for cleanup; never read during render.
  const orderClientRef = useRef<Client | null>(null);
  const vendorClientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!USE_WEBSOCKET) return;

    const token = getCookie(TokenType.authToken);
    if (isUserLoading || !user || !token) return;

    const orderWebsocketUrl = ORDER_WS_URL;
    const vendorWebsocketUrl = VENDOR_WS_URL;
    if (!orderWebsocketUrl || !vendorWebsocketUrl) return;

    const userRole = user.role;

    if (userRole === "CUSTOMER") {
      const oClient = new Client({
        webSocketFactory: () => new SockJS(orderWebsocketUrl),
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        // debug: (str) => console.log('[Order STOMP]', str),
      });

      oClient.onConnect = () => {
        setOrderClient(oClient);
        setIsOrderConnected(true);
      };
      oClient.onWebSocketClose = () => {
        setOrderClient(null);
        setIsOrderConnected(false);
      };
      oClient.activate();
      orderClientRef.current = oClient;
    } else if (userRole === "MANAGER" || userRole === "STAFF") {
      const vClient = new Client({
        webSocketFactory: () => new SockJS(vendorWebsocketUrl),
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        // debug: (str) => console.log('[Vendor STOMP]', str),
      });

      vClient.onConnect = () => {
        setVendorClient(vClient);
        setIsVendorConnected(true);
      };
      vClient.onWebSocketClose = () => {
        setVendorClient(null);
        setIsVendorConnected(false);
      };
      vClient.activate();
      vendorClientRef.current = vClient;
    }

    return () => {
      if (orderClientRef.current) {
        orderClientRef.current.deactivate();
        orderClientRef.current = null;
      }
      if (vendorClientRef.current) {
        vendorClientRef.current.deactivate();
        vendorClientRef.current = null;
      }
    };
  }, [user, isUserLoading]);

  // Audio Unlock mechanism for notification sounds
  useEffect(() => {
    const unlockAudio = () => {
      const audio = new Audio("/assets/sounds/notification.mp3");
      audio.volume = 0;
      audio
        .play()
        .then(() => {
          console.log("Audio unlocked for notifications");
          window.removeEventListener("click", unlockAudio);
          window.removeEventListener("keydown", unlockAudio);
          window.removeEventListener("touchstart", unlockAudio);
        })
        .catch((err) => {
          console.log("Audio unlock failed, waiting for interaction...", err);
        });
    };

    window.addEventListener("click", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);

    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{ orderClient, vendorClient, isOrderConnected, isVendorConnected }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
