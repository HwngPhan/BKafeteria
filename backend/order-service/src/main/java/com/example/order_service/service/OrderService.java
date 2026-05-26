package com.example.order_service.service;

import com.example.order_service.dtos.MenuItemInfoDto;
import com.example.order_service.dtos.UserInfoDto;
import com.example.order_service.dtos.VendorInfoDto;
import com.example.order_service.helper.IamClient;
import com.example.order_service.helper.MenuClient;
import com.example.order_service.helper.VendorClient;
import com.example.order_service.helper.producer.KafkaProducerService;
import com.example.order_service.model.Order;
import com.example.order_service.model.VendorOrder;
import com.example.order_service.repository.OrderRepository;
import com.example.order_service.repository.VendorOrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.example.order_service.dtos.Request.ItemRequest;
import com.example.order_service.dtos.Request.OrderRequest;
import com.example.order_service.dtos.Request.VendorOrderRequest;
import com.example.order_service.dtos.KafkaMessage.VendorNotificationMessage;
import com.example.order_service.model.MenuItem;
import com.example.order_service.model.OrderItem;
import com.example.shared.enums.OrderStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final MenuClient menuClient;
    private final IamClient iamClient;
    private final VendorClient vendorClient;
    private final VendorOrderRepository vendorOrderRepository;
    private final KafkaProducerService kafkaProducerService;
    private final SimpMessagingTemplate messagingTemplate;

    public OrderService(OrderRepository orderRepository, MenuClient menuClient, IamClient iamClient,
            VendorClient vendorClient, VendorOrderRepository vendorOrderRepository,
            KafkaProducerService kafkaProducerService, SimpMessagingTemplate messagingTemplate) {
        this.orderRepository = orderRepository;
        this.menuClient = menuClient;
        this.iamClient = iamClient;
        this.vendorClient = vendorClient;
        this.vendorOrderRepository = vendorOrderRepository;
        this.kafkaProducerService = kafkaProducerService;
        this.messagingTemplate = messagingTemplate;
    }

    public Order getOrderById(String id) {
        return orderRepository.findById(id).orElse(null);
    }

    public Page<Order> getOrders(String customerId, Pageable pageable) {
        return orderRepository.findByCustomerId(customerId, pageable);
    }

    public Order createOrder(OrderRequest orderRequest, String customerId) throws RuntimeException {
        Order order = new Order();
        List<OrderItem> orderItems = new ArrayList<>();

        Double totalOrderPrice = 0.0;
        List<MenuItem> reducedItems = new ArrayList<>();

        try {
            for (VendorOrderRequest vendorReq : orderRequest.getVendorOrders()) {
                OrderItem orderItem = new OrderItem();
                orderItem.setVendorId(vendorReq.getVendorId());
                VendorInfoDto vendorInfoDto = vendorClient.getVendorInfo(orderItem.getVendorId());
                orderItem.setVendorName(vendorInfoDto.getName());
                List<MenuItem> menuItems = new ArrayList<>();
                Double vendorItemPrice = 0.0;

                UserInfoDto customer = iamClient.getUserInfo(customerId);

                Integer points = customer.getPoints() != null ? customer.getPoints() : 0;
                double discountPercentage = 0.0;
                if (points >= 2000) {
                    discountPercentage = 0.20;
                } else if (points >= 500) {
                    discountPercentage = 0.15;
                } else if (points >= 100) {
                    discountPercentage = 0.10;
                } else if (points >= 50) {
                    discountPercentage = 0.05;
                }


                for (ItemRequest itemReq : vendorReq.getItems()) {
                    MenuItemInfoDto itemInfoDto = menuClient.getItemInfo(itemReq.getItemId());
                    if (itemInfoDto.getRemaining() <= 0)
                        throw new RuntimeException("Item unavailable");
                    MenuItem menuItem = new MenuItem();
                    menuItem.setItemId(itemReq.getItemId());
                    menuItem.setQuantity(itemReq.getQuantity());
                    if (itemInfoDto.getRemaining() < itemReq.getQuantity())
                        throw new RuntimeException(
                                "Item " + itemInfoDto.getName() + " has only " + itemInfoDto.getRemaining()
                                        + " remaining");

                    menuClient.updateRemaining(itemReq.getItemId(), itemInfoDto.getRemaining() - itemReq.getQuantity());
                    reducedItems.add(menuItem);

                    menuItem.setItemName(itemInfoDto.getName());
                    // Discount item price based on customer's points
                    double itemPrice = itemInfoDto.getPrice() * (1.0 - discountPercentage);
                    menuItem.setPrice(itemPrice);
                    vendorItemPrice += menuItem.getPrice() * menuItem.getQuantity();

                    menuItems.add(menuItem);
                }
                orderItem.setMenuItems(menuItems);
                orderItem.setVendorPrice(vendorItemPrice);
                orderItems.add(orderItem);

                totalOrderPrice += vendorItemPrice;
            }

            order.setOrderItems(orderItems);
            order.setStatus(OrderStatus.PENDING);
            order.setCreatedAt(LocalDateTime.now());
            order.setUpdatedAt(LocalDateTime.now());

            // Membership
            order.setTotalPrice(totalOrderPrice);
            order.setCustomerId(customerId);
            Order savedOrder = orderRepository.save(order);

            // Create VendorOrders with PENDING status immediately on order creation
            for (OrderItem orderItem : orderItems) {
                VendorOrder vendorOrder = new VendorOrder();
                vendorOrder.setVendorId(orderItem.getVendorId());
                vendorOrder.setVendorName(orderItem.getVendorName());
                vendorOrder.setMenuItems(orderItem.getMenuItems());
                vendorOrder.setVendorPrice(orderItem.getVendorPrice());
                vendorOrder.setOrderId(savedOrder.getOrderId());
                vendorOrder.setStatus(OrderStatus.PENDING);
                vendorOrderRepository.save(vendorOrder);
            }

            return savedOrder;
        } catch (Exception e) {
            for (MenuItem reducedItem : reducedItems) {
                try {
                    MenuItemInfoDto itemInfoDto = menuClient.getItemInfo(reducedItem.getItemId());
                    menuClient.updateRemaining(reducedItem.getItemId(),
                            itemInfoDto.getRemaining() + reducedItem.getQuantity());
                } catch (Exception ex) {
                    logger.error("Failed to revert remaining quantity for item {}", reducedItem.getItemId(), ex);
                }
            }
            throw e;
        }
    }

    public void makePayment(String orderId, String customerId) throws RuntimeException {
        Order order = getOrderById(orderId);
        if (order == null)
            throw new RuntimeException("Order not found");
        if (order.getStatus() != OrderStatus.PENDING)
            throw new RuntimeException("Order is not in PENDING state");
        if (!customerId.equals(order.getCustomerId()))
            throw new RuntimeException("Invalid customerId");
        UserInfoDto customer = iamClient.getUserInfo(customerId);
        if (customer.getBalance() < order.getTotalPrice())
            throw new RuntimeException("Insufficient balance");

        iamClient.setBalance(customerId, customer.getBalance() - order.getTotalPrice());
        int pointsToAdd = (int) (order.getTotalPrice() / 10000);
        if (pointsToAdd > 0) {
            iamClient.addPoints(customerId, pointsToAdd);
        }

        List<VendorOrder> vendorOrders = vendorOrderRepository.findByOrderId(orderId);

        for (VendorOrder vendorOrder : vendorOrders) {
            // Calculate new balance for vendor manager
            VendorInfoDto vendorInfoDto = vendorClient.getVendorInfo(vendorOrder.getVendorId());
            UserInfoDto manager = iamClient.getUserInfo(vendorInfoDto.getManagerId());
            iamClient.setBalance(vendorInfoDto.getManagerId(), manager.getBalance() + vendorOrder.getVendorPrice());

            // Update status from PENDING to PURCHASED
            vendorOrder.setStatus(OrderStatus.PURCHASED);
            vendorOrderRepository.save(vendorOrder);

            // Send Kafka notification to vendor
            VendorNotificationMessage notification = new VendorNotificationMessage();
            notification.setOrderId(orderId);
            notification.setVendorOrderId(vendorOrder.getVendorOrderId());
            notification.setVendorId(vendorOrder.getVendorId());
            notification.setCustomerId(customerId);
            notification.setStatus(OrderStatus.PURCHASED);
            notification.setMessage("New order received");
            notification.setMenuItems(vendorOrder.getMenuItems());

            try {
                kafkaProducerService.send("vendor-orders", notification);
                logger.info("Successfully sent Kafka notification to vendor: {} for order: {}",
                        vendorOrder.getVendorId(), orderId);
            } catch (Exception e) {
                logger.error("Failed to send Kafka notification to vendor: {} for order: {}",
                        vendorOrder.getVendorId(), orderId, e);
            }
        }
        order.setStatus(OrderStatus.PURCHASED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
    }

    public Order cancelOrder(String orderId, String customerId) {
        Order order = getOrderById(orderId);
        if (order == null)
            throw new RuntimeException("Order not found");
        if (!customerId.equals(order.getCustomerId()))
            throw new RuntimeException("Unauthorized to cancel this order");
        if (order.getStatus() == OrderStatus.CANCELED)
            throw new RuntimeException("Order is already cancelled");
        if (order.getStatus() == OrderStatus.COMPLETED)
            throw new RuntimeException("Cannot cancel a completed order");

        List<VendorOrder> vendorOrders = vendorOrderRepository.findByOrderId(orderId);

        if (order.getStatus() == OrderStatus.PURCHASED) {
            UserInfoDto customer = iamClient.getUserInfo(customerId);
            iamClient.setBalance(customerId, customer.getBalance() + order.getTotalPrice());

            for (VendorOrder vendorOrder : vendorOrders) {
                VendorInfoDto vendorInfoDto = vendorClient.getVendorInfo(vendorOrder.getVendorId());
                UserInfoDto manager = iamClient.getUserInfo(vendorInfoDto.getManagerId());
                iamClient.setBalance(vendorInfoDto.getManagerId(), manager.getBalance() - vendorOrder.getVendorPrice());
            }
        }

        for (OrderItem orderItem : order.getOrderItems()) {
            if (orderItem.getMenuItems() != null) {
                for (MenuItem menuItem : orderItem.getMenuItems()) {
                    try {
                        MenuItemInfoDto itemInfoDto = menuClient.getItemInfo(menuItem.getItemId());
                        menuClient.updateRemaining(menuItem.getItemId(),
                                itemInfoDto.getRemaining() + menuItem.getQuantity());
                    } catch (Exception e) {
                        logger.error("Failed to restore remaining quantity for item {}", menuItem.getItemId(), e);
                    }
                }
            }
        }

        for (VendorOrder vendorOrder : vendorOrders) {
            vendorOrder.setStatus(OrderStatus.CANCELED);
            vendorOrderRepository.save(vendorOrder);
        }

        // Notify vendor managers if payment had already been made
        if (order.getStatus() == OrderStatus.PURCHASED) {
            for (VendorOrder vendorOrder : vendorOrders) {
                VendorNotificationMessage notification = new VendorNotificationMessage();
                notification.setOrderId(orderId);
                notification.setVendorOrderId(vendorOrder.getVendorOrderId());
                notification.setVendorId(vendorOrder.getVendorId());
                notification.setCustomerId(customerId);
                notification.setStatus(OrderStatus.CANCELED);
                notification.setMessage("Order cancelled by customer");
                notification.setMenuItems(vendorOrder.getMenuItems());
                try {
                    kafkaProducerService.send("vendor-orders", notification);
                    logger.info("Sent cancel notification to vendor: {} for order: {}", vendorOrder.getVendorId(), orderId);
                } catch (Exception e) {
                    logger.error("Failed to send cancel notification to vendor: {} for order: {}", vendorOrder.getVendorId(), orderId, e);
                }
            }
        }

        order.setStatus(OrderStatus.CANCELED);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    public Order cancelVendorOrder(String vendorOrderId, String managerId) {
        VendorOrder vendorOrder = vendorOrderRepository.findById(vendorOrderId)
                .orElseThrow(() -> new RuntimeException("VendorOrder not found"));

        if (vendorOrder.getStatus() == OrderStatus.CANCELED)
            throw new RuntimeException("VendorOrder is already cancelled");
        if (vendorOrder.getStatus() == OrderStatus.COMPLETED)
            throw new RuntimeException("Cannot cancel a completed VendorOrder");

        // Authorize: manager/staff must belong to this vendor
        UserInfoDto managerInfo = iamClient.getUserInfo(managerId);
        boolean authorized = managerInfo.getVendorId() != null &&
                Arrays.asList(managerInfo.getVendorId().split(",")).contains(vendorOrder.getVendorId());
        if (!authorized)
            throw new RuntimeException("Unauthorized to cancel this vendor order");

        Order order = getOrderById(vendorOrder.getOrderId());
        if (order == null)
            throw new RuntimeException("Order not found");

        // Refund if customer has already paid
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CANCELED) {
            UserInfoDto customer = iamClient.getUserInfo(order.getCustomerId());
            iamClient.setBalance(order.getCustomerId(), customer.getBalance() + vendorOrder.getVendorPrice());

            VendorInfoDto vendorInfoDto = vendorClient.getVendorInfo(vendorOrder.getVendorId());
            UserInfoDto vendorManager = iamClient.getUserInfo(vendorInfoDto.getManagerId());
            iamClient.setBalance(vendorInfoDto.getManagerId(), vendorManager.getBalance() - vendorOrder.getVendorPrice());
        }

        // Restore menu item quantities
        // if (vendorOrder.getMenuItems() != null) {
        //     for (MenuItem menuItem : vendorOrder.getMenuItems()) {
        //         try {
        //             MenuItemInfoDto itemInfoDto = menuClient.getItemInfo(menuItem.getItemId());
        //             menuClient.updateRemaining(menuItem.getItemId(),
        //                     itemInfoDto.getRemaining() + menuItem.getQuantity());
        //         } catch (Exception e) {
        //             logger.error("Failed to restore remaining quantity for item {}", menuItem.getItemId(), e);
        //         }
        //     }
        // }

        vendorOrder.setStatus(OrderStatus.CANCELED);
        vendorOrderRepository.save(vendorOrder);

        // Notify customer via WebSocket
        VendorNotificationMessage cancelNotification = new VendorNotificationMessage();
        cancelNotification.setOrderId(vendorOrder.getOrderId());
        cancelNotification.setVendorOrderId(vendorOrder.getVendorOrderId());
        cancelNotification.setVendorId(vendorOrder.getVendorId());
        cancelNotification.setCustomerId(order.getCustomerId());
        cancelNotification.setStatus(OrderStatus.CANCELED);
        cancelNotification.setMessage("Your vendor order has been cancelled by the vendor");
        cancelNotification.setMenuItems(vendorOrder.getMenuItems());
        messagingTemplate.convertAndSend("/topic/customer/" + order.getCustomerId(), cancelNotification);
        logger.info("Pushed cancel notification to customer: {} for vendorOrder: {}", order.getCustomerId(), vendorOrderId);

        // Update parent order status based on remaining sibling VendorOrders
        List<VendorOrder> siblings = vendorOrderRepository.findByOrderId(vendorOrder.getOrderId());
        boolean allCanceled = siblings.stream().allMatch(vo -> vo.getStatus() == OrderStatus.CANCELED);
        boolean onlyCanceledOrCompleted = siblings.stream()
                .allMatch(vo -> vo.getStatus() == OrderStatus.CANCELED || vo.getStatus() == OrderStatus.COMPLETED);
        boolean hasCompleted = siblings.stream().anyMatch(vo -> vo.getStatus() == OrderStatus.COMPLETED);

        if (allCanceled) {
            order.setStatus(OrderStatus.CANCELED);
            order.setUpdatedAt(LocalDateTime.now());
        } else if (onlyCanceledOrCompleted && hasCompleted) {
            order.setStatus(OrderStatus.COMPLETED);
            order.setUpdatedAt(LocalDateTime.now());
        }
        return orderRepository.save(order);
    }

    @org.springframework.scheduling.annotation.Scheduled(fixedDelay = 60000)
    public void cancelUnpaidOrders() {
        LocalDateTime twoMinutesAgo = LocalDateTime.now().minusMinutes(2);
        List<Order> pendingOrders = orderRepository.findByStatusAndCreatedAtBefore(OrderStatus.PENDING, twoMinutesAgo);
        for (Order order : pendingOrders) {
            order.setStatus(OrderStatus.CANCELED);
            order.setUpdatedAt(LocalDateTime.now());

            List<VendorOrder> vendorOrders =
            vendorOrderRepository.findByOrderId(order.getOrderId());
            for (VendorOrder vendorOrder : vendorOrders) {
            vendorOrder.setStatus(OrderStatus.CANCELED);
            vendorOrderRepository.save(vendorOrder);
            }

            // Return remaining dishes
            if (order.getOrderItems() != null) {
                for (OrderItem orderItem : order.getOrderItems()) {
                    if (orderItem.getMenuItems() != null) {
                        for (MenuItem menuItem : orderItem.getMenuItems()) {
                            try {
                                MenuItemInfoDto itemInfoDto = menuClient.getItemInfo(menuItem.getItemId());
                                menuClient.updateRemaining(menuItem.getItemId(),
                                        itemInfoDto.getRemaining() + menuItem.getQuantity());
                            } catch (Exception e) {
                                logger.error("Failed to restore remaining quantity for item {}", menuItem.getItemId(),
                                        e);
                            }
                        }
                    }
                }
            }
            orderRepository.save(order);
            logger.info("Auto-canceled unpaid order: {}", order.getOrderId());
        }
    }
}
