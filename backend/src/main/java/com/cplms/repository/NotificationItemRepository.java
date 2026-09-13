package com.cplms.repository;

import com.cplms.entity.NotificationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationItemRepository extends JpaRepository<NotificationItem, UUID> {
    List<NotificationItem> findTop20ByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);
    long countByRecipientEmailAndReadFalse(String recipientEmail);
}
