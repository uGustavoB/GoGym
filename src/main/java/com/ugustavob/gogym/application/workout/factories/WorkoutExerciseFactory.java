package com.ugustavob.gogym.application.workout.factories;

import com.ugustavob.gogym.application.workout.dto.CreateWorkoutExerciseRequestDTO;
import com.ugustavob.gogym.domain.entities.Exercise;
import com.ugustavob.gogym.domain.entities.Workout;
import com.ugustavob.gogym.domain.entities.WorkoutExercise;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WorkoutExerciseFactory {

    private final PlannedSetFactory plannedSetFactory;

    public WorkoutExercise create(CreateWorkoutExerciseRequestDTO dto, Workout parent, Exercise exercise) {
        WorkoutExercise workoutExercise = new WorkoutExercise();
        workoutExercise.setOrderIndex(dto.orderIndex());
        workoutExercise.setNotes(dto.notes());
        workoutExercise.setExercise(exercise);
        workoutExercise.setWorkout(parent);

        dto.plannedSets().forEach(setDto -> {
            workoutExercise.getPlannedSets().add(plannedSetFactory.create(setDto, workoutExercise));
        });

        return workoutExercise;
    }
}