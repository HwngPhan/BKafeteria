package com.example.api_gateway.config;

import org.springdoc.core.models.GroupedOpenApi;
//import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
	@Bean
	public GroupedOpenApi userServiceApi() {
		return GroupedOpenApi.builder()
					.group("iam-service")
					.pathsToMatch("/api/iam/**")
					.addOpenApiCustomizer(openApi -> {
							openApi.setInfo(new io.swagger.v3.oas.models.info.Info()
											.title("IAM Service API")
											.version("1.0.0"));
							openApi.getServers().clear();
							openApi.addServersItem(new io.swagger.v3.oas.models.servers.Server().url("/"));
					})
					.build();
	}

	@Bean
	public GroupedOpenApi orderServiceApi() {
		return GroupedOpenApi.builder()
						.group("patient-service")
						.pathsToMatch("/api/patient/**")
						.addOpenApiCustomizer(openApi -> {
								openApi.setInfo(new io.swagger.v3.oas.models.info.Info()
												.title("Patient Service API")
												.version("1.0.0"));
								openApi.getServers().clear();
								openApi.addServersItem(new io.swagger.v3.oas.models.servers.Server().url("/"));
						})
						.build();
	}

	@Bean
	public GroupedOpenApi productServiceApi() {
		return GroupedOpenApi.builder()
						.group("test-order-service")
						.pathsToMatch("/api/testorder/**")
						.addOpenApiCustomizer(openApi -> {
								openApi.setInfo(new io.swagger.v3.oas.models.info.Info()
												.title("Test Order Service API")
												.version("1.0.0"));
								openApi.getServers().clear();
								openApi.addServersItem(new io.swagger.v3.oas.models.servers.Server().url("/"));
						})
						.build();
	}
}