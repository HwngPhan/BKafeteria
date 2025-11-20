package com.example.iam_service.service;

import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;

import com.example.iam_service.model.User;
import com.example.iam_service.repository.UserRepository;
import com.example.shared.enums.UserStatus;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.StringRedisTemplate;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {
    private final UserRepository userRepository;
    private final JavaMailSender javaMailSender;
    private final StringRedisTemplate stringRedisTemplate;

    private final Random random = new Random();

    public OtpService(JavaMailSender javaMailSender, StringRedisTemplate stringRedisTemplate, UserRepository userRepository) {
        this.javaMailSender = javaMailSender;
        this.stringRedisTemplate = stringRedisTemplate;
        this.userRepository = userRepository;
    }

    @Async
    public void sendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        if(user.getStatus() != UserStatus.ACTIVE){
            throw new IllegalStateException("Account is not activated");
        }
        String otp = generateOtp();
        stringRedisTemplate.opsForValue().set("otp:" + email, otp, 5, TimeUnit.MINUTES);
        try{
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, "UTF-8");
            mimeMessageHelper.setTo(email);
            mimeMessageHelper.setSubject("[BKafeteria] Your OTP Code");
            String htmlContent = getOTPHtmlTemplate(otp, user.getFullName());
            mimeMessageHelper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);

        } catch(MessagingException e){
            throw new RuntimeException("Failed to send otp", e);
        }
    }

    public boolean verifyOtp(String email, String otp) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        String storedOtp = stringRedisTemplate.opsForValue().get("otp:" + email);
        if (storedOtp == null) {
            throw new RuntimeException("OTP has expired or does not exist for email: " + email);
        }
        if (storedOtp.equals(otp)) {
            stringRedisTemplate.delete("otp:" + email);
            return true;
        }
        return false;
    }

    private String generateOtp() {
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    private String getOTPHtmlTemplate(String otp, String fullName){
        ClassPathResource resource = new ClassPathResource("mailTemplate/otpMail.html");
        try (var inputStream = resource.getInputStream()) {
            String content = new String(inputStream.readAllBytes());
            return content.replace("{{OTP}}", otp)
                    .replace("{{name}}", fullName);
        } catch(Exception e){
            throw new RuntimeException("Fail to find HTMLTemplate", e);
        }
    }
}
