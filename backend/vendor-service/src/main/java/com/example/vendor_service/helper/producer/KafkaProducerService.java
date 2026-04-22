package com.example.vendor_service.helper.producer;

import com.example.vendor_service.dtos.KafkaMessage.OrderStatusUpdateMessage;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public KafkaProducerService(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendStatusUpdate(String topic, OrderStatusUpdateMessage message) {
        kafkaTemplate.send(topic, message);
    }
}
