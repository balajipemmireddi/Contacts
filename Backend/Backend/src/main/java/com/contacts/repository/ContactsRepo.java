package com.contacts.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.contacts.entity.Contact;

public interface ContactsRepo extends JpaRepository<Contact, Long>{

	List<Contact> findByFirstNameContainingIgnoreCase(String firstName);

    List<Contact> findByPhoneNumberContaining(String phoneNumber);

    List<Contact> findByEmailContainingIgnoreCase(String email);

}
