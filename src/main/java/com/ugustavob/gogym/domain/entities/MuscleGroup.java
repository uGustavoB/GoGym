package com.ugustavob.gogym.domain.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "muscle_groups")
@Data
public class MuscleGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;

}