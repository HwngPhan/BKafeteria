package com.example.order_service.helper;
import com.example.order_service.model.MenuItem;
import com.example.order_service.model.Order;
import com.example.order_service.model.OrderItem;
import com.example.order_service.repository.OrderRepository;
import com.example.shared.enums.OrderStatus;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitialization implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitialization.class);
    private final OrderRepository orderRepository;

    public DataInitialization(OrderRepository orderRepository){
        this.orderRepository=orderRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        logger.info("Starting data initialization...");
        createOrderIfNotExists();
        logger.info("Data initialization completed successfully!");
    }

    private void createOrderIfNotExists() {
        if (orderRepository.count() == 0) {
            logger.info("Initializing dummy order...");
            createOrder();
            logger.info("Created initial order successfully!");
        }
        else {
            logger.info("Order already exists");
        }
    }

    private void createOrder(){
        List<MenuItem> menuItems = List.of(
                new MenuItem("I-12345678", "test", 1, 10000.0)
        );

        List<OrderItem> orderItems = List.of(
                new OrderItem("V-21420247", "Test", menuItems, 10000.0)
        );

        Order order = new Order();
        order.setOrderId("O-12345678");
        order.setStatus(OrderStatus.PENDING);
        order.setOrderItems(orderItems);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        order.setTotalPrice(10000.0);
        order.setCustomerId("U-32345678");
        orderRepository.save(order);
    }

}

