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
					.pathsToMatch("/iam/**")
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
	public GroupedOpenApi vendorServiceApi() {
		return GroupedOpenApi.builder()
						.group("vendor-service")
						.pathsToMatch("/api/vendor/**")
						.addOpenApiCustomizer(openApi -> {
								openApi.setInfo(new io.swagger.v3.oas.models.info.Info()
												.title("Vendor Service API")
												.version("1.0.0"));
								openApi.getServers().clear();
								openApi.addServersItem(new io.swagger.v3.oas.models.servers.Server().url("/"));
						})
						.build();
	}

	@Bean
	public GroupedOpenApi orderServiceApi() {
		return GroupedOpenApi.builder()
						.group("order-service")
						.pathsToMatch("/api/order/**")
						.addOpenApiCustomizer(openApi -> {
								openApi.setInfo(new io.swagger.v3.oas.models.info.Info()
												.title("Order Service API")
												.version("1.0.0"));
								openApi.getServers().clear();
								openApi.addServersItem(new io.swagger.v3.oas.models.servers.Server().url("/"));
						})
						.build();
	}
	@Bean
	public GroupedOpenApi menuServiceApi() {
		return GroupedOpenApi.builder()
					.group("menu-service")
					.pathsToMatch("/api/menu/**")
					.addOpenApiCustomizer(openApi -> {
								openApi.setInfo(new io.swagger.v3.oas.models.info.Info()
										.title("Menu Service API")
										.version("1.0.0"));
								openApi.getServers().clear();
								openApi.addServersItem(new io.swagger.v3.oas.models.servers.Server().url("/"));
					})
					.build();
	}
}