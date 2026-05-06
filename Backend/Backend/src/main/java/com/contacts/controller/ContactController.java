package com.contacts.controller;

import com.contacts.dto.ContactDto;
import com.contacts.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/contacts")
@CrossOrigin
public class ContactController {

    @Autowired
    private ContactService contactService;

    @GetMapping
    public ResponseEntity<List<ContactDto>> getAll(Principal principal) {
        return ResponseEntity.ok(contactService.getAllContacts(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<ContactDto> add(@RequestBody ContactDto dto, Principal principal) {
        return ResponseEntity.ok(contactService.addContact(principal.getName(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactDto> update(@PathVariable Long id, @RequestBody ContactDto dto, Principal principal) {
        return ResponseEntity.ok(contactService.updateContact(principal.getName(), id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        contactService.deleteContact(principal.getName(), id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/favorite")
    public ResponseEntity<ContactDto> toggleFavorite(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(contactService.toggleFavorite(principal.getName(), id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ContactDto>> search(@RequestParam String query, Principal principal) {
        return ResponseEntity.ok(contactService.searchContacts(principal.getName(), query));
    }
}
