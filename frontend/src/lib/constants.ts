export const API_GATEWAY_BASE_URL = process.env.NEXT_PUBLIC_PRODUCTION === 'true' ?
  `${process.env.NEXT_PUBLIC_API_GATEWAY_PROD_URL}/api` :
  `${process.env.NEXT_PUBLIC_API_GATEWAY_DEV_URL}/api`

export enum TokenType {
  authToken = "authToken",
  otpToken = "otpToken",
}

export const CATEGORY_MAP: Record<string, string> = {
  BEVERAGES: 'Đồ uống',
  PASTRIES: 'Bánh ngọt',
  SNACKS: 'Ăn nhẹ',
  MEALS: 'Bữa chính',
  DESSERTS: 'Tráng miệng',
}

// Real-time updates configuration
// If both are false, the app will only update on manual refresh (F5)
export const USE_WEBSOCKET = false; // Set to true for live push notifications (higher CPU)
export const USE_POLLING = true;   // Set to true for background refresh every 5-10s
