package com.contacts.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.contacts.entity.Contact;
import com.contacts.service.ContactsService;

@RestController
@RequestMapping("/contacts")
public class ContactsController {

    @Autowired
    private ContactsService contactsService;

    // ADD CONTACT
    @PostMapping("/add/{userId}")
    public Contact addContact(@RequestBody Contact contact, @PathVariable Long userId) {

        return contactsService.addContact(contact, userId);
    }

    // GET ALL CONTACTS
    @GetMapping("/all")
    public List<Contact> getAllContacts() {

        return contactsService.getAllContacts();
    }

    // GET CONTACT BY ID
    @GetMapping("/{id}")
    public Contact getContactById(@PathVariable Long id) {

        return contactsService.getContactById(id);
    }

    // UPDATE CONTACT
    @PutMapping("/update/{id}")
    public Contact updateContact(@PathVariable Long id,
                                  @RequestBody Contact contact) {

        return contactsService.updateContact(id, contact);
    }

    // DELETE CONTACT
    @DeleteMapping("/delete/{id}")
    public String deleteContact(@PathVariable Long id) {

        return contactsService.deleteContact(id);
    }

    // SEARCH BY NAME
    @GetMapping("/search/name/{name}")
    public List<Contact> searchByName(@PathVariable String name) {

        return contactsService.searchByFirstName(name);
    }

    // SEARCH BY PHONE
    @GetMapping("/search/phone/{phone}")
    public List<Contact> searchByPhone(@PathVariable String phone) {

        return contactsService.searchByPhoneNumber(phone);
    }

    // SEARCH BY EMAIL
    @GetMapping("/search/email/{email}")
    public List<Contact> searchByEmail(@PathVariable String email) {

        return contactsService.searchByEmail(email);
    }
}