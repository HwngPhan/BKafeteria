# WebSocket Integration Guide

This guide provides the necessary details for the Frontend team to integrate with the real-time notification system using WebSockets (STOMP protocol).

## 1. Connection Overview

The backend uses **STOMP (Simple Text Oriented Messaging Protocol)** over WebSockets, with **SockJS** as a fallback mechanism for browsers or networks that do not support raw WebSockets.

### Base Endpoints
Depending on whether you are a Customer or a Vendor, you should connect to the respective service's WebSocket endpoint via the API Gateway.

| User Role | Gateway Endpoint | Service (Internal) |
| :--- | :--- | :--- |
| **Customer** | `ws://{GATEWAY_HOST}:8080/api/order/ws` | Order Service |
| **Vendor** | `ws://{GATEWAY_HOST}:8080/api/vendor/ws` | Vendor Service |

> [!NOTE]
> Since we use SockJS, you should use the `http` prefix when initializing the SockJS client (e.g., `http://localhost:8080/api/order/ws`). The SockJS library will handle the protocol upgrade.

---

## 2. Authentication Strategy

Currently, the WebSocket endpoints (`/ws/**`) are configured as `permitAll()` in the backend security configuration. However, to ensure future-proofing and consistency, you should pass the JWT access token during the STOMP connection phase.

### Client-side Implementation (React Example)

We recommend using `@stomp/stompjs` and `sockjs-client`.

```typescript
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const token = 'YOUR_JWT_TOKEN';

const client = new Client({
  webSocketFactory: () => new SockJS('http://localhost:8080/api/order/ws'),
  connectHeaders: {
    Authorization: `Bearer ${token}`,
  },
  onConnect: () => {
    console.log('Connected to WebSocket');
    // Subscribe to topics here
  },
  onStompError: (frame) => {
    console.error('Broker reported error: ' + frame.headers['message']);
  },
});

client.activate();
```

---

## 3. Subscriptions (Server-to-Client)

The frontend should subscribe to the following topics to receive real-time updates.

### A. Customer Notifications
**Topic:** `/topic/customer/{customerId}`  
**Purpose:** Notifies the customer when the status of their order (or a specific vendor order within it) changes.

**Payload Interface:**
```typescript
enum OrderStatus {
  PENDING = 'PENDING',
  PURCHASED = 'PURCHASED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED'
}

interface OrderStatusUpdateMessage {
  orderId: string;
  vendorOrderId: string;
  vendorId: string;
  customerId: string;
  status: OrderStatus;
  message: string;
  timestamp: string; // ISO 8601 string
}
```

### B. Vendor Notifications
**Topic:** `/topic/vendor/{vendorId}`  
**Purpose:** Notifies a vendor when a new order has been placed at their shop.

**Payload Interface:**
```typescript
interface MenuItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
}

interface VendorNotificationMessage {
  orderId: string;
  vendorOrderId: string;
  vendorId: string;
  customerId: string;
  status: OrderStatus;
  message: string;
  menuItems: MenuItem[];
}
```

---

## 4. Publishing (Client-to-Server)

**Currently, there are no Client-to-Server WebSocket mappings.**  
All actions (creating orders, updating status, etc.) must be performed via the standard **REST API** endpoints. The backend will automatically trigger the WebSocket notifications after successful REST operations.

---

## 5. Error Handling & Stability

- **Heartbeats:** The backend is configured for heartbeats. It is recommended to set `heartbeatIncoming` and `heartbeatOutgoing` to `4000` (4 seconds) in your STOMP client configuration.
- **Reconnection:** The client should implement a reconnection strategy (e.g., `reconnectDelay: 5000`).
- **Protocol:** The current method is correctly implemented as a push-based system (WebSocket), **not polling**.

---

## 6. Known Issues / Missing Information

> [!WARNING]
> **Subscription Security:** The current backend implementation does not yet strictly validate subscription requests to specific topics. Technically, any connected client could subscribe to any `{customerId}` topic if they know the ID. This is scheduled for a future security hardening update using a `ChannelInterceptor`.

> [!IMPORTANT]
> **Gateway Configuration:** Ensure the API Gateway allows WebSocket upgrades. If you experience `403 Forbidden` or `Connection Refused`, verify the Gateway routing rules and CORS settings.
