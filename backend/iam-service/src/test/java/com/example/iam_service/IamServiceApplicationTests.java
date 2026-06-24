package com.example.iam_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driverClassName=org.h2.Driver",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.datasource.username=sa",
    "spring.datasource.password=password",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.kafka.bootstrap-servers=localhost:9092",
    "spring.data.redis.host=localhost",
    "spring.data.redis.port=6379",
    "jwt.secret=test-secret-key-for-integration-testing-only-minimum-256-bits",
    "jwt.access.expiration=86400000",
    "jwt.refresh.expiration=604800000",
    "jwt.otp.expiration=300000",
    "jwt.account.expiration=86400000",
    "frontend.url=http://localhost:3000",
    "server.port=0"
})
class IamServiceApplicationTests {

    @MockBean
    private JavaMailSender javaMailSender;
    @MockBean
    private StringRedisTemplate stringRedisTemplate;

    @Test
    void contextLoads() {
    }
}
