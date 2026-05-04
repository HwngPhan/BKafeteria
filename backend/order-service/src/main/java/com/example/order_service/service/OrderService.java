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
import org.springframework.stereotype.Service;

import com.example.order_service.dtos.Request.ItemRequest;
import com.example.order_service.dtos.Request.OrderRequest;
import com.example.order_service.dtos.Request.VendorOrderRequest;
import com.example.order_service.dtos.KafkaMessage.VendorNotificationMessage;
import com.example.order_service.model.MenuItem;
import com.example.order_service.model.OrderItem;
import com.example.shared.enums.OrderStatus;
import com.example.shared.enums.VendorStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
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

    public OrderService(OrderRepository orderRepository, MenuClient menuClient, IamClient iamClient,
            VendorClient vendorClient, VendorOrderRepository vendorOrderRepository,
            KafkaProducerService kafkaProducerService) {
        this.orderRepository = orderRepository;
        this.menuClient = menuClient;
        this.iamClient = iamClient;
        this.vendorClient = vendorClient;
        this.vendorOrderRepository = vendorOrderRepository;
        this.kafkaProducerService = kafkaProducerService;
    }

    public Order getOrderById(String id) {
        return orderRepository.findById(id).orElse(null);
    }

    public List<Order> getOrders(String customerId) {
        return orderRepository.findByCustomerId(customerId);
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

                List<MenuItem> menuItems = new ArrayList<>();
                Double vendorItemPrice = 0.0;

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
                    menuItem.setPrice(itemInfoDto.getPrice());

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
            return orderRepository.save(order);
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

        double actualPrice = order.getTotalPrice() * (1.0 - discountPercentage);

        iamClient.setBalance(customerId, customer.getBalance() - actualPrice);
        order.setTotalPrice(actualPrice);
        int pointsToAdd = (int) (order.getTotalPrice() / 10000);
        if (pointsToAdd > 0) {
            iamClient.addPoints(customerId, pointsToAdd);
        }

        for (OrderItem orderItem : order.getOrderItems()) {
            // calculate new balance
            VendorInfoDto vendorInfoDto = vendorClient.getVendorInfo(orderItem.getVendorId());
            UserInfoDto manager = iamClient.getUserInfo(vendorInfoDto.getManagerId());
            iamClient.setBalance(vendorInfoDto.getManagerId(), manager.getBalance() + orderItem.getVendorPrice());
            // Remaining was updated during createOrder
            // Create vendorOrders for each vendor

            VendorOrder vendorOrder = new VendorOrder();
            vendorOrder.setVendorId(orderItem.getVendorId());
            vendorOrder.setMenuItems(orderItem.getMenuItems());
            vendorOrder.setVendorPrice(orderItem.getVendorPrice());
            vendorOrder.setOrderId(orderId);
            vendorOrder.setStatus(OrderStatus.PURCHASED);

            // Info vendor /orders/topic/{id}
            // Create topic
            VendorOrder savedVendorOrder = vendorOrderRepository.save(vendorOrder);

            // Send Kafka notification to vendor
            VendorNotificationMessage notification = new VendorNotificationMessage();
            notification.setOrderId(orderId);
            notification.setVendorOrderId(savedVendorOrder.getVendorOrderId());
            notification.setVendorId(orderItem.getVendorId());
            notification.setCustomerId(customerId);
            notification.setStatus(OrderStatus.PURCHASED);
            notification.setMessage("New order received");
            notification.setMenuItems(orderItem.getMenuItems());

            try {
                kafkaProducerService.send("vendor-orders", notification);
                logger.info("Successfully sent Kafka notification to vendor: {} for order: {}",
                        orderItem.getVendorId(), orderId);
            } catch (Exception e) {
                logger.error("Failed to send Kafka notification to vendor: {} for order: {}",
                        orderItem.getVendorId(), orderId, e);
            }

        }
        order.setStatus(OrderStatus.PURCHASED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
    }

    @org.springframework.scheduling.annotation.Scheduled(fixedDelay = 60000)
    public void cancelUnpaidOrders() {
        LocalDateTime twoMinutesAgo = LocalDateTime.now().minusMinutes(2);
        List<Order> pendingOrders = orderRepository.findByStatusAndCreatedAtBefore(OrderStatus.PENDING, twoMinutesAgo);
        for (Order order : pendingOrders) {
            order.setStatus(OrderStatus.CANCELED);
            order.setUpdatedAt(LocalDateTime.now());

            // List<VendorOrder> vendorOrders =
            // vendorOrderRepository.findByOrderId(order.getOrderId());
            // for (VendorOrder vendorOrder : vendorOrders) {
            // vendorOrder.setStatus(OrderStatus.CANCELED);
            // vendorOrderRepository.save(vendorOrder);
            // }

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
