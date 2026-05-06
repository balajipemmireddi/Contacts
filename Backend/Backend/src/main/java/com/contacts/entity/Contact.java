package com.contacts.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Contact {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstName;
    private String lastName;
    @Column(nullable = true)
    private String email;
    @Column(unique = true)
    private String phoneNumber;
    @Column(nullable = true)
    private String address;
    
    // Map the new Java field name 'favorite' to the existing database column 'is_favorite'
    @Column(name = "is_favorite", nullable = false)
    private boolean favorite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Users user;

}
