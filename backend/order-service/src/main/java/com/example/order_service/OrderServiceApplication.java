package com.example.order_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;
@SpringBootApplication(scanBasePackages = {
		"com.example.order_service",
		"com.example.shared"
})
@EnableAsync
public class OrderServiceApplication {

	public static void main(String[] args) {

		loadEnvFile();
		SpringApplication.run(OrderServiceApplication.class, args);
	}
	private static void loadEnvFile() {
		try {
			File envFile = new File("../.env");
			if (envFile.exists()) {
				Properties props = new Properties();
				props.load(new FileInputStream(envFile));

				props.forEach((key, value) -> {
					System.setProperty(key.toString(), value.toString());
				});

				System.out.println("Loaded " + props.size() + " properties from .env file");
			}
		} catch (IOException e) {
			System.err.println("Could not load .env file: " + e.getMessage());
		}
	}
}
