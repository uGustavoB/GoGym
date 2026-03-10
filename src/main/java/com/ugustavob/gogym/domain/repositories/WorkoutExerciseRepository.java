package com.ugustavob.gogym.domain.repositories;

import com.ugustavob.gogym.domain.entities.WorkoutExercise;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutExerciseRepository extends JpaRepository<WorkoutExercise, Long> {
}
