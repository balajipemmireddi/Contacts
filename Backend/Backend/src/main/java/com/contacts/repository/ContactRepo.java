package com.contacts.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.contacts.entity.Contact;
import com.contacts.entity.Users;

@Repository
public interface ContactRepo extends JpaRepository<Contact, Long> {
    List<Contact> findByUserId(Long userId);
    Optional<Contact> findByIdAndUserId(Long id, Long userId);
}
