package com.ugustavob.gogym.application.workout.factories;

import com.ugustavob.gogym.application.workout.dto.CreatePlannedSetRequestDTO;
import com.ugustavob.gogym.domain.entities.PlannedSet;
import com.ugustavob.gogym.domain.entities.WorkoutExercise;
import org.springframework.stereotype.Component;

@Component
public class PlannedSetFactory {
    public PlannedSet create(CreatePlannedSetRequestDTO dto, WorkoutExercise parent) {
        PlannedSet plannedSet = new PlannedSet();
        plannedSet.setSetNumber(dto.setNumber());
        plannedSet.setSetType(dto.setType());
        plannedSet.setTargetReps(dto.targetReps());
        plannedSet.setRir(dto.rir());
        plannedSet.setRestTimeSeconds(dto.restTimeSeconds());
        plannedSet.setWorkoutExercise(parent);
        return plannedSet;
    }
}