package com.ugustavob.gogym.domain.entities;

import com.ugustavob.gogym.domain.enums.EquipmentType;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "equipments")
@Data
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipmentType type;
}