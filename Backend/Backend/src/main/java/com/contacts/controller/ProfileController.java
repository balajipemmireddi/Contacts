package com.contacts.controller;

import com.contacts.entity.Users;
import com.contacts.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin
public class ProfileController {

    @Autowired
    private UserRepo userRepo;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile(Principal principal) {
        Users user = userRepo.findByEmail(principal.getName());
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> profile = new HashMap<>();
        profile.put("firstName", user.getFirstName());
        profile.put("lastName", user.getLastName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());
        profile.put("createdDate", user.getCreatedDate());
        profile.put("id", user.getId());

        return ResponseEntity.ok(profile);
    }
}
