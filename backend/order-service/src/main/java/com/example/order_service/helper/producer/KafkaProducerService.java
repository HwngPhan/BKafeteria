package com.example.order_service.helper.producer;

import com.example.order_service.dtos.KafkaMessage.VendorNotificationMessage;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public KafkaProducerService(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void send(String topic, VendorNotificationMessage message) {
        kafkaTemplate.send(topic, message);
    }
}