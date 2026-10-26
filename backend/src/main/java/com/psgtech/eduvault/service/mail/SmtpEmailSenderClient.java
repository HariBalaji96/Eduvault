package com.psgtech.eduvault.service.mail;

import jakarta.mail.internet.MimeMessage;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnClass(name = "org.springframework.mail.javamail.JavaMailSender")
public class SmtpEmailSenderClient implements EmailSenderClient {

    private final JavaMailSender mailSender;

    public SmtpEmailSenderClient(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void send(String fromEmail, String toEmail, String subject, String textBody, String htmlBody) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        if (fromEmail != null && !fromEmail.isBlank()) {
            try {
                helper.setFrom(fromEmail, "Eduvault");
            } catch (Exception ex) {
                helper.setFrom(fromEmail);
            }
        }
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(textBody, htmlBody);
        mailSender.send(message);
    }
}
