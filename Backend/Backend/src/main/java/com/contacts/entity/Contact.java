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
    
    // Renamed from isFavorite to favorite to fix mapping bugs
    @Column(nullable = false)
    private boolean favorite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Users user;

}
