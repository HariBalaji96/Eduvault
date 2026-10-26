package com.psgtech.eduvault.service.mail;

public interface EmailSenderClient {
    void send(String fromEmail, String toEmail, String subject, String textBody, String htmlBody) throws Exception;
}
