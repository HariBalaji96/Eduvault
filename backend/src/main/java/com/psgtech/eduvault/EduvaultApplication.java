package com.psgtech.eduvault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class EduvaultApplication {

	public static void main(String[] args) {
		SpringApplication.run(EduvaultApplication.class, args);
	}

}
