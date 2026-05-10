package com.example.order_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import com.example.order_service.helper.IamClient;
import com.example.order_service.helper.MenuClient;
import com.example.order_service.helper.VendorClient;
import com.example.order_service.helper.producer.KafkaProducerService;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driverClassName=org.h2.Driver",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.datasource.username=sa",
    "spring.datasource.password=password",
    "spring.kafka.bootstrap-servers=localhost:9092",
    "spring.data.redis.host=localhost",
    "spring.data.redis.port=6379"
})
class OrderServiceApplicationTests {

    @MockBean
    private IamClient iamClient;
    @MockBean
    private MenuClient menuClient;
    @MockBean
    private VendorClient vendorClient;
    @MockBean
    private KafkaProducerService kafkaProducerService;

    @Test
    void contextLoads() {
    }
}
