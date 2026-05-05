package com.example.vendor_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import com.example.vendor_service.helper.IamClient;
import com.example.vendor_service.helper.producer.KafkaProducerService;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driverClassName=org.h2.Driver",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.datasource.username=sa",
    "spring.datasource.password=password",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.kafka.bootstrap-servers=localhost:9092",
    "spring.data.redis.host=localhost",
    "spring.data.redis.port=6379"
})
class VendorServiceApplicationTests {

    @MockBean
    private IamClient iamClient;
    @MockBean
    private KafkaProducerService kafkaProducerService;

    @Test
    void contextLoads() {
    }
}
