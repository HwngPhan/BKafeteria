# WebSocket Fix: Migrate Gateway to Reactive (WebFlux)

## Problem Summary

The frontend cannot connect to WebSocket because of a **fundamental mismatch** between how the API Gateway routes WebSocket traffic and how the frontend connects.

### Root Cause: Two Separate Issues

**Issue 1 — Order WebSocket uses raw `ws://` (wrong protocol for SockJS)**
```ts
// WebSocketProvider.tsx line 39 — BROKEN
brokerURL: 'ws://localhost:8080/api/order/ws',  // raw WebSocket, no SockJS fallback
```
The backend registers `/ws` with **SockJS** (`withSockJS()`). SockJS uses a special HTTP handshake, not a raw `ws://` connection. The `brokerURL` property is for raw WebSocket only. To use SockJS you must use `webSocketFactory: () => new SockJS(...)`.

**Issue 2 — API Gateway strips the wrong prefix for WebSocket routes**
```yaml
# application.yml
- id: order-service-ws
  predicates:
    - Path=/api/order/ws/**   # matches /api/order/ws/...
  filters:
    - StripPrefix=2           # strips /api/order → leaves /ws/...  ✅ CORRECT
```
This is actually correct — `StripPrefix=2` on `/api/order/ws/**` leaves `/ws/...` which is what the backend expects. BUT the issue is that Spring Cloud Gateway MVC (non-reactive) does **not support WebSocket proxying** natively. You need either Spring Cloud Gateway **reactive** (WebFlux) or a different approach.

**Verified Architecture:**
- API Gateway port: **8080** (the only public-facing port)
- IAM Service: **8000** — path prefix: `/api/iam` → strips `/api` → backend sees `/iam/auth`, `/iam/users`
- Vendor Service: **8001** — path prefix: `/api/vendor` → strips `/api` → backend sees `/vendor/...`
- Menu Service: **8002** — path prefix: `/api/menu` → strips `/api` → backend sees `/menu/items`
- Order Service: **8003** — path prefix: `/api/order` → strips `/api` → backend sees `/order/orders`
- WebSocket (order): `/api/order/ws/**` → strips 2 → backend sees `/ws/**`
- WebSocket (vendor): `/api/vendor/ws/**` → strips 2 → backend sees `/ws/**`

> [!IMPORTANT]
> The API Gateway uses **Spring Cloud Gateway Server MVC** (`spring.cloud.gateway.server.webmvc`), which is the **servlet-based** (not reactive) version. This version does NOT support WebSocket proxying. WebSocket connections must go **directly to the service ports** (8003 for order, 8001 for vendor), bypassing the gateway.

## Frontend API Audit — All Endpoints Correctly Implemented ✅

After full audit, the REST API calls in the frontend are **correctly mapped**. No changes needed to any `.api.ts` files.

| Service | Gateway Path | Backend Controller | Frontend API File | Status |
|---|---|---|---|---|
| IAM Auth | `POST /api/iam/auth/login` | `AuthController /auth/login` | `auth.api.ts` | ✅ |
| IAM Auth | `POST /api/iam/auth/register` | `AuthController /auth/register` | `auth.api.ts` | ✅ |
| IAM Auth | `POST /api/iam/auth/refresh` | `AuthController /auth/refresh` | `auth.api.ts` | ✅ |
| IAM Auth | `POST /api/iam/auth/logout` | `AuthController /auth/logout` | `auth.api.ts` | ✅ |
| IAM Auth | `POST /api/iam/auth/send-otp` | `AuthController /auth/send-otp` | `auth.api.ts` | ✅ |
| IAM Auth | `POST /api/iam/auth/verify-otp` | `AuthController /auth/verify-otp` | `auth.api.ts` | ✅ |
| IAM Auth | `POST /api/iam/auth/reset-password` | `AuthController /auth/reset-password` | `auth.api.ts` | ✅ |
| IAM Auth | `GET /api/iam/auth/account-activation` | `AuthController /auth/account-activation` | `auth.api.ts` | ✅ |
| Menu | `GET /api/menu/items/get-all` | `MenuItemController /items/get-all` | `menu.api.ts` | ✅ |
| Menu | `GET /api/menu/items/{id}` | `MenuItemController /items/{id}` | `menu.api.ts` | ✅ |
| Menu | `GET /api/menu/items/get-by-vendor/{vendorId}` | `MenuItemController /items/get-by-vendor/{vendorId}` | `menu.api.ts` | ✅ |
| Menu | `GET /api/menu/items/get-my-menu` | `MenuItemController /items/get-my-menu` | `menu.api.ts` | ✅ |
| Menu | `POST /api/menu/items/create` | `MenuItemController /items/create` | `menu.api.ts` | ✅ |
| Menu | `PUT /api/menu/items/update/{id}` | `MenuItemController /items/update/{id}` | `menu.api.ts` | ✅ |
| Menu | `PUT /api/menu/items/img/{id}` | `MenuItemController /items/img/{id}` | `menu.api.ts` | ✅ |
| Menu | `DELETE /api/menu/items/delete/{id}` | `MenuItemController /items/delete/{id}` | `menu.api.ts` | ✅ |
| Order | `GET /api/order/orders/get-my-order` | `OrderController /orders/get-my-order` | `order.api.ts` | ✅ |
| Order | `GET /api/order/orders/{id}` | `OrderController /orders/{id}` | `order.api.ts` | ✅ |
| Order | `POST /api/order/orders` | `OrderController /orders` | `order.api.ts` | ✅ |
| Order | `PUT /api/order/orders/{id}/payment` | `OrderController /orders/{id}/payment` | `order.api.ts` | ✅ |
| Vendor | `GET /api/vendor/vendors/active` | `VendorController /vendors/active` | `vendor.api.ts` | ✅ |
| Vendor | `GET /api/vendor/vendors/{id}` | `VendorController /vendors/{id}` | `vendor.api.ts` | ✅ |
| Vendor | `GET /api/vendor/vendors/get-my-vendor` | `VendorController /vendors/get-my-vendor` | `vendor.api.ts` | ✅ |
| Vendor | `GET /api/vendor/vendors` | `VendorController /vendors` | `vendor.api.ts` | ✅ |
| Vendor | `POST /api/vendor/vendors/register` | `VendorController /vendors/register` | `vendor.api.ts` | ✅ |
| Vendor | `PUT /api/vendor/vendors/approve/{id}` | `VendorController /vendors/approve/{id}` | `vendor.api.ts` | ✅ |
| Vendor | `PUT /api/vendor/vendors/{id}` | `VendorController /vendors/{id}` | `vendor.api.ts` | ✅ |
| VendorOrder | `GET /api/vendor/vendor-orders/notifications` | `VendorOrderController /vendor-orders/notifications` | `vendor-order.api.ts` | ✅ |
| VendorOrder | `GET /api/vendor/vendor-orders/get-vendor-order` | `VendorOrderController /vendor-orders/get-vendor-order` | `vendor-order.api.ts` | ✅ |
| VendorOrder | `POST /api/vendor/vendor-orders/{id}/confirm` | `VendorOrderController /vendor-orders/{id}/confirm` | `vendor-order.api.ts` | ✅ |
| VendorOrder | `POST /api/vendor/vendor-orders/{id}/mark-finished` | `VendorOrderController /vendor-orders/{id}/mark-finished` | `vendor-order.api.ts` | ✅ |

## WebSocket Endpoints

| Service | Backend STOMP endpoint | Subscribe topics | Frontend Hook |
|---|---|---|---|
| order-service (port 8003) | `/ws` (SockJS + raw) | `/topic/customer/{userId}` | `useOrderWebSocket.ts` |
| vendor-service (port 8001) | `/ws` (SockJS + raw) | `/topic/vendor/{vendorId}` | `useVendorWebSocket.ts` |

## Fix Plan

Since Spring Cloud Gateway MVC cannot proxy WebSocket, we must connect **directly to service ports** from the frontend (no gateway for WS). Both services already expose their ports in docker-compose.

### Fix 1: Update `WebSocketProvider.tsx`

Both clients must use `webSocketFactory: () => new SockJS(url)` instead of `brokerURL`. The direct service URLs bypass the gateway:

```ts
// Order WebSocket — direct to order-service port 8003
webSocketFactory: () => new SockJS('http://localhost:8003/ws')

// Vendor WebSocket — direct to vendor-service port 8001  
webSocketFactory: () => new SockJS('http://localhost:8001/ws')
```

We'll also add an environment variable `NEXT_PUBLIC_ORDER_SERVICE_URL` and `NEXT_PUBLIC_VENDOR_SERVICE_URL` so that in production we can point to the correct hosts.

### Fix 2: Update `.env.local`

Add direct service URLs for WebSocket connections:
```
NEXT_PUBLIC_ORDER_WS_URL=http://localhost:8003
NEXT_PUBLIC_VENDOR_WS_URL=http://localhost:8001
```

### Fix 3: Update `constants.ts`

Export the new WebSocket base URLs.

## Chosen Approach: Switch Gateway to Reactive WebFlux

The frontend will connect to WebSocket **only through the API gateway** at port 8080. The gateway proxies WebSocket traffic to each service. This requires migrating the API gateway from `spring-cloud-starter-gateway-server-webmvc` (servlet) to `spring-cloud-starter-gateway` (reactive/WebFlux).

### What Changes in the Backend Gateway?

| Area | Before (WebMVC) | After (WebFlux/Reactive) |
|---|---|---|
| Maven dependency | `spring-cloud-starter-gateway-server-webmvc` | `spring-cloud-starter-gateway` |
| Swagger UI lib | `springdoc-openapi-starter-webmvc-ui` | `springdoc-openapi-starter-webflux-ui` |
| Spring Security | `HttpSecurity` (servlet) | `ServerHttpSecurity` (reactive) |
| SecurityConfig | `SecurityFilterChain` bean | `SecurityWebFilterChain` bean |
| application.yml routes | `spring.cloud.gateway.server.webmvc.routes` | `spring.cloud.gateway.routes` |
| WebSocket support | ❌ Not supported | ✅ Native support |
| `.env` loading code | Works via `System.setProperty` | Works the same |

> [!NOTE]
> The route predicates and filters in `application.yml` stay almost identical — only the YAML key changes from `spring.cloud.gateway.server.webmvc` to `spring.cloud.gateway`. WebSocket routes use `lb://` or `ws://` URIs exactly as before.

### Frontend WebSocket URLs (through gateway at 8080)

```ts
// Both connect through the gateway — frontend only knows port 8080
webSocketFactory: () => new SockJS('http://localhost:8080/api/order/ws')
webSocketFactory: () => new SockJS('http://localhost:8080/api/vendor/ws')
```

## Verification Plan

1. Build and run docker-compose
2. Verify order-service port 8003 is accessible from host
3. Verify vendor-service port 8001 is accessible from host  
4. Open browser devtools → Network tab → WS filter
5. Confirm SockJS handshake succeeds to `localhost:8003/ws/...`
6. Confirm SockJS handshake succeeds to `localhost:8001/ws/...`
7. Place an order → verify toast notification appears in customer view
8. As MANAGER/STAFF → verify new order notification appears in vendor view
