package com.contacts.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

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
    
    @JsonProperty("favorite")
    @Column(name = "is_favorite", nullable = false)
    private boolean favorite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Users user;

}
