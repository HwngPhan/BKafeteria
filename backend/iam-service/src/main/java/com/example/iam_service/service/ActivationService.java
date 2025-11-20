package com.example.iam_service.service;

import com.example.iam_service.dtos.UserDtos.CreateUserRequest;
import com.example.iam_service.model.User;
import com.example.iam_service.repository.UserRepository;
import com.example.shared.enums.UserStatus;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ActivationService {
    private final JavaMailSender javaMailSender;
    private final UserRepository userRepository;
    private final StringRedisTemplate stringRedisTemplate;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.account.expiration}")
	private long expirationTime;

    @Value("${frontend.url}")
    private String frontendUrl;

    public ActivationService(JavaMailSender javaMailSender, UserRepository userRepository,
                             StringRedisTemplate stringRedisTemplate, PasswordEncoder passwordEncoder) {
        this.javaMailSender = javaMailSender;
        this.userRepository = userRepository;
        this.stringRedisTemplate = stringRedisTemplate;
        this.passwordEncoder = passwordEncoder;
    }

    @Async
    public void sendActivationEmail(CreateUserRequest createUserRequest, String token, User user){
		try{
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, "UTF-8");
            mimeMessageHelper.setTo(createUserRequest.getEmail());
            mimeMessageHelper.setSubject("[BKafeteria] Activate Your Account");
			
			String activationLink = frontendUrl + "iam/auth/account-activation?token=" + token;
            String htmlContent = getActivateUserHtmlTemplate(user.getFullName(), activationLink);
            mimeMessageHelper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);

        } catch(MessagingException e){
            throw new RuntimeException("Failed to send activation email", e);
        }
	}

    @Async
    public void sendActivationEmailResend(String token, User user) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(
                mimeMessage, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, "UTF-8");

            mimeMessageHelper.setTo(user.getEmail());
            mimeMessageHelper.setSubject("[BKafeteria] Resend: Activate Your Account");

            String activationLink = frontendUrl + "/account-activation/resetPassword?token=" + token;
            String htmlContent = getActivateUserHtmlTemplate(user.getFullName(), activationLink);
            mimeMessageHelper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to resend activation email", e);
        }
    }

    private String getActivateUserHtmlTemplate(String name, String activationLink){
		ClassPathResource resource = new ClassPathResource("mailTemplate/activateUserMail.html");
        try (var inputStream = resource.getInputStream()) {
            String content = new String(inputStream.readAllBytes());
            return content.replace("{{name}}", name).replace("{{activation_link}}", activationLink);
        } catch(Exception e){
            throw new RuntimeException("Fail to find HTMLTemplate", e);
        }

	}

    @Transactional
	public User activateResetPassword(String token, String newPassword){
        String email = stringRedisTemplate.opsForValue().get("activate:" + token);
		if (email == null) {
			throw new IllegalArgumentException("Invalid or expired activation token");
		}
        User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("User not found with email" + email));

		if (user.getStatus() == UserStatus.ACTIVE) {
			throw new IllegalArgumentException("User is already activated");
		}

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("This is the same as the old password!");
        }
        user.setPassword(passwordEncoder.encode(newPassword));

        user.setStatus(UserStatus.ACTIVE);
		user.setUpdatedAt(LocalDateTime.now());
		stringRedisTemplate.delete("activate:" + token);
        userRepository.save(user);
		return user;
	}

	public void activateUserValidate(String token) {
		String email = stringRedisTemplate.opsForValue().get("activate:" + token);
		if (email == null) {
			throw new IllegalArgumentException("Invalid or expired activation token");
		}
        User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("User not found with email" + email));

		if (user.getStatus() == UserStatus.ACTIVE) {
			throw new IllegalArgumentException("User is already activated");
		}

        user.setStatus(UserStatus.ACTIVE);
        user.setUpdatedAt(LocalDateTime.now());
        stringRedisTemplate.delete("activate:" + token);
        userRepository.save(user);
    }

}
