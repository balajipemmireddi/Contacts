package com.contacts.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.contacts.entity.Contact;

@Repository
public interface ContactRepo extends JpaRepository<Contact, Long> {
    List<Contact> findByUserId(Long userId);
    Optional<Contact> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT c FROM Contact c WHERE c.user.id = :userId AND (" +
            "LOWER(c.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "c.phoneNumber LIKE CONCAT('%', :query, '%'))")
    List<Contact> searchContacts(@Param("userId") Long userId, @Param("query") String query);
}
