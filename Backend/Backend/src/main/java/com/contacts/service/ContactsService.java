package com.contacts.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.contacts.entity.Contact;
import com.contacts.entity.Users;
import com.contacts.repository.ContactsRepo;
import com.contacts.repository.UserRepo;

@Service
public class ContactsService {

	 @Autowired
	    private ContactsRepo contactsRepository;
	 
	   @Autowired
	    private UserRepo usersRepository;

	    // ADD CONTACT
	 public Contact addContact(Contact contact, Long userId) {

	        // Fetch logged-in user
	        Users user = usersRepository.findById(userId)
	                .orElseThrow(() -> new RuntimeException("User Not Found"));

	        // Set user into contact
	        contact.setUser(user);

	        // Save
	        return contactsRepository.save(contact);
	    }

	    // GET ALL CONTACTS
	    public List<Contact> getAllContacts() {
	        return contactsRepository.findAll();
	    }

	    // GET CONTACT BY ID
	    public Contact getContactById(Long id) {

	        return contactsRepository.findById(id)
	                .orElseThrow(() -> new RuntimeException("Contact Not Found"));
	    }

	    // UPDATE CONTACT
	    public Contact updateContact(Long id, Contact contact) {

	        Contact existingContact = contactsRepository.findById(id)
	                .orElseThrow(() -> new RuntimeException("Contact Not Found"));

	        existingContact.setFirstName(contact.getFirstName());
	        existingContact.setLastName(contact.getLastName());
	        existingContact.setEmail(contact.getEmail());
	        existingContact.setPhoneNumber(contact.getPhoneNumber());
	        existingContact.setAddress(contact.getAddress());
	        existingContact.setFavorite(contact.isFavorite());

	        return contactsRepository.save(existingContact);
	    }

	    // DELETE CONTACT
	    public String deleteContact(Long id) {

	        Contact contact = contactsRepository.findById(id)
	                .orElseThrow(() -> new RuntimeException("Contact Not Found"));

	        contactsRepository.delete(contact);

	        return "Contact Deleted Successfully";
	    }

	    // SEARCH BY FIRST NAME
	    public List<Contact> searchByFirstName(String firstName) {

	        return contactsRepository
	                .findByFirstNameContainingIgnoreCase(firstName);
	    }

	    // SEARCH BY PHONE NUMBER
	    public List<Contact> searchByPhoneNumber(String phoneNumber) {

	        return contactsRepository
	                .findByPhoneNumberContaining(phoneNumber);
	    }

	    // SEARCH BY EMAIL
	    public List<Contact> searchByEmail(String email) {

	        return contactsRepository
	                .findByEmailContainingIgnoreCase(email);
	    }
}
