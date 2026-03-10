package com.ugustavob.gogym.application.workout.usecases;

import com.ugustavob.gogym.application.workout.dto.CreateWorkoutExerciseRequestDTO;
import com.ugustavob.gogym.application.workout.factories.WorkoutExerciseFactory;
import com.ugustavob.gogym.domain.entities.Exercise;
import com.ugustavob.gogym.domain.entities.Workout;
import com.ugustavob.gogym.domain.entities.WorkoutExercise;
import com.ugustavob.gogym.domain.exception.ExerciseNotFoundException;
import com.ugustavob.gogym.domain.repositories.ExerciseRepository;
import com.ugustavob.gogym.domain.repositories.WorkoutExerciseRepository;
import com.ugustavob.gogym.domain.repositories.WorkoutRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AddExerciseToWorkoutInteractor {

    private final WorkoutRepository workoutRepository;
    private final ExerciseRepository exerciseRepository;
    private final WorkoutExerciseRepository workoutExerciseRepository;
    private final WorkoutExerciseFactory factory;

    @Transactional
    public WorkoutExercise execute(Long workoutId, CreateWorkoutExerciseRequestDTO input) {
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new RuntimeException("Treino não encontrado."));

        Exercise exercise = exerciseRepository.findById(input.exerciseId())
                .orElseThrow(ExerciseNotFoundException::new);

        WorkoutExercise newExercise = factory.create(input, workout, exercise);

        return workoutExerciseRepository.save(newExercise);
    }
}