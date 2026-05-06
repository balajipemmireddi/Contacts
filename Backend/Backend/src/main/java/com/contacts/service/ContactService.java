package com.contacts.service;

import com.contacts.dto.ContactDto;
import com.contacts.entity.Contact;
import com.contacts.entity.Users;
import com.contacts.repository.ContactRepo;
import com.contacts.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactService {

    @Autowired
    private ContactRepo contactRepo;

    @Autowired
    private UserRepo userRepo;

    public List<ContactDto> getAllContacts(String email) {
        Users user = userRepo.findByEmail(email);
        return contactRepo.findByUserId(user.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ContactDto addContact(String email, ContactDto dto) {
        Users user = userRepo.findByEmail(email);
        Contact contact = new Contact();
        mapToEntity(dto, contact);
        contact.setUser(user);
        return mapToDto(contactRepo.save(contact));
    }

    public ContactDto updateContact(String email, Long id, ContactDto dto) {
        Users user = userRepo.findByEmail(email);
        Contact contact = contactRepo.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        mapToEntity(dto, contact);
        return mapToDto(contactRepo.save(contact));
    }

    public void deleteContact(String email, Long id) {
        Users user = userRepo.findByEmail(email);
        Contact contact = contactRepo.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        contactRepo.delete(contact);
    }

    public ContactDto toggleFavorite(String email, Long id) {
        Users user = userRepo.findByEmail(email);
        Contact contact = contactRepo.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        contact.setFavorite(!contact.isFavorite());
        return mapToDto(contactRepo.save(contact));
    }

    public List<ContactDto> searchContacts(String email, String query) {
        Users user = userRepo.findByEmail(email);
        String q = query.toLowerCase();
        return contactRepo.findByUserId(user.getId())
                .stream()
                .filter(c -> 
                    (c.getFirstName() != null && c.getFirstName().toLowerCase().contains(q)) ||
                    (c.getLastName() != null && c.getLastName().toLowerCase().contains(q)) ||
                    (c.getEmail() != null && c.getEmail().toLowerCase().contains(q)) ||
                    (c.getPhoneNumber() != null && c.getPhoneNumber().contains(q))
                )
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ContactDto mapToDto(Contact contact) {
        return new ContactDto(
                contact.getId(),
                contact.getFirstName(),
                contact.getLastName(),
                contact.getEmail(),
                contact.getPhoneNumber(),
                contact.getAddress(),
                contact.isFavorite()
        );
    }

    private void mapToEntity(ContactDto dto, Contact contact) {
        contact.setFirstName(dto.getFirstName());
        contact.setLastName(dto.getLastName());
        contact.setEmail(dto.getEmail());
        contact.setPhoneNumber(dto.getPhoneNumber());
        contact.setAddress(dto.getAddress());
        contact.setFavorite(dto.isFavorite());
    }
}
