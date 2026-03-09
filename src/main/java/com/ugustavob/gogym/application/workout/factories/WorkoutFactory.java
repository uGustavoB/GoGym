package com.ugustavob.gogym.application.workout.factories;

import com.ugustavob.gogym.application.workout.dto.CreateWorkoutRequestDTO;
import com.ugustavob.gogym.domain.entities.Exercise;
import com.ugustavob.gogym.domain.entities.Workout;
import com.ugustavob.gogym.domain.entities.WorkoutProgram;
import com.ugustavob.gogym.domain.exception.ExerciseNotFoundException;
import com.ugustavob.gogym.domain.repositories.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WorkoutFactory {

    private final WorkoutExerciseFactory workoutExerciseFactory;
    private final ExerciseRepository exerciseRepository;

    public Workout create(CreateWorkoutRequestDTO dto, WorkoutProgram parent) {
        Workout workout = new Workout();
        workout.setName(dto.name());
        workout.setOrderIndex(dto.orderIndex());
        workout.setWorkoutProgram(parent);

        dto.exercises().forEach(exerciseDto -> {
            Exercise exercise = exerciseRepository.findById(exerciseDto.exerciseId())
                    .orElseThrow(ExerciseNotFoundException::new);

            workout.getWorkoutExercises().add(workoutExerciseFactory.create(exerciseDto, workout, exercise));
        });

        return workout;
    }
}