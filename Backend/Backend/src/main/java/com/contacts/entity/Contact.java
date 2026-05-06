package com.contacts.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Contact {
    @Id
    private Long id;
    private String firstName;
    private String lastName;
    @Column(nullable = true)
    private String email;
    @Column(unique = true)
    private String phoneNumber;
    @Column(nullable = true)
    private String Address;
    @Column(nullable = true)
    private boolean isFavorite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Users user;

}
