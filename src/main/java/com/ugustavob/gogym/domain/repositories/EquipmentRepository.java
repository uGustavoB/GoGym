package com.ugustavob.gogym.domain.repositories;

import com.ugustavob.gogym.domain.entities.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    Optional<Equipment> findByName(String name);
    Optional<Equipment> findByNameIgnoreCase(String name);
}
