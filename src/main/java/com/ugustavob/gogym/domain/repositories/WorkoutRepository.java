package com.ugustavob.gogym.domain.repositories;

import com.ugustavob.gogym.domain.entities.Workout;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {
}