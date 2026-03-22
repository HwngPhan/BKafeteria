package com.example.order_service.service;

import com.example.order_service.model.Order;
import com.example.order_service.repository.OrderRepository;
import org.springframework.stereotype.Service;

import com.example.order_service.dtos.Request.ItemRequest;
import com.example.order_service.dtos.Request.OrderRequest;
import com.example.order_service.dtos.Request.VendorOrderRequest;
import com.example.order_service.model.MenuItem;
import com.example.order_service.model.OrderItem;
import com.example.shared.enums.OrderStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository){
        this.orderRepository = orderRepository;
    }

    public Order getOrderById(String id){
        return orderRepository.findById(id).orElse(null);
    }

    public Order createOrder(OrderRequest orderRequest){
        Order order = new Order();
        List<OrderItem> orderItems = new ArrayList<>();
        
        Double totalOrderPrice = 0.0;
        
        for (VendorOrderRequest vendorReq : orderRequest.getVendorOrders()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setVendorId(vendorReq.getVendorId());
            
            List<MenuItem> menuItems = new ArrayList<>();
            Double vendorItemPrice = 0.0;
            
            for (ItemRequest itemReq : vendorReq.getItems()) {
                MenuItem menuItem = new MenuItem();
                menuItem.setItemId(itemReq.getItemId());
                menuItem.setQuantity(itemReq.getQuantity());
                // TODO: Fetch itemName and price from MenuService using itemId
                // Currently set to defaults
                menuItem.setPrice(0.0);
                
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
        order.setTotalPrice(totalOrderPrice);
        
        return orderRepository.save(order);
    }
}
