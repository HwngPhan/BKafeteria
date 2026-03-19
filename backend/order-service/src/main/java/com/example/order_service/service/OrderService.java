package com.example.order_service.service;

import com.example.order_service.model.Order;
import com.example.order_service.repository.OrderRepository;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository){
        this.orderRepository = orderRepository;
    }

    public Order getOrderById(String id){
        return orderRepository.findById(id).orElse(null);
    }
}
