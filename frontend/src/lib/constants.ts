export const API_GATEWAY_BASE_URL = process.env.NEXT_PUBLIC_PRODUCTION === 'true' ?
  `${process.env.NEXT_PUBLIC_API_GATEWAY_PROD_URL}/api` :
  `${process.env.NEXT_PUBLIC_API_GATEWAY_DEV_URL}/api`

export const ORDER_WS_URL = process.env.NEXT_PUBLIC_PRODUCTION === 'true' ?
  process.env.NEXT_PUBLIC_ORDER_WS_PROD_URL :
  process.env.NEXT_PUBLIC_ORDER_WS_DEV_URL

export const VENDOR_WS_URL = process.env.NEXT_PUBLIC_PRODUCTION === 'true' ?
  process.env.NEXT_PUBLIC_VENDOR_WS_PROD_URL :
  process.env.NEXT_PUBLIC_VENDOR_WS_DEV_URL

export enum TokenType {
  authToken = "authToken",
  otpToken = "otpToken",
}

export const CATEGORY_MAP: Record<string, string> = {
  BEVERAGES: 'category.beverages',
  PASTRIES: 'category.pastries',
  SNACKS: 'category.snacks',
  MEALS: 'category.meals',
  DESSERTS: 'category.desserts',
}

// Real-time updates configuration
// If both are false, the app will only update on manual refresh (F5)
export const USE_WEBSOCKET = true;  // Live push notifications via STOMP/SockJS
export const USE_POLLING = false;   // Disabled — WebSocket handles real-time updates
