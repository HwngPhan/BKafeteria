export const API_GATEWAY_BASE_URL = process.env.PRODUCTION === 'true' ?
    `${process.env.NEXT_PUBLIC_API_GATEWAY_PROD_URL}/api` :
    `${process.env.NEXT_PUBLIC_API_GATEWAY_DEV_URL}/api`

export enum TokenType {
    authToken = "authToken",
    otpToken = "otpToken",
}

