package com.ugustavob.gogym.domain.repositories;

import com.ugustavob.gogym.domain.entities.MuscleGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MuscleGroupRepository extends JpaRepository<MuscleGroup, Long> {
    Optional<MuscleGroup> findByName(String name);

    Optional<MuscleGroup> findByNameIgnoreCase(String newName);
}