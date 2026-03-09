package com.ugustavob.gogym.domain.repositories;

import com.ugustavob.gogym.domain.entities.WorkoutProgram;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutProgramRepository extends JpaRepository<WorkoutProgram, Long> {
    List<WorkoutProgram> findByUserId(Long userId);
}