package com.ugustavob.gogym.domain.repositories;

import com.ugustavob.gogym.domain.entities.Exercise;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    Optional<Exercise> findByName(String name);
    Optional<Exercise> findByNameIgnoreCase(String name);

    @Override
    @EntityGraph(attributePaths = {"muscleGroup", "equipment"})
    List<Exercise> findAll();

    @Override
    @EntityGraph(attributePaths = {"muscleGroup", "equipment"})
    Optional<Exercise> findById(Long id);
}
