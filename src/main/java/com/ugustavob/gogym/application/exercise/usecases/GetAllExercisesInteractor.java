package com.ugustavob.gogym.application.exercise.usecases;

import com.ugustavob.gogym.domain.entities.Exercise;
import com.ugustavob.gogym.domain.repositories.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetAllExercisesInteractor {
    private final ExerciseRepository exerciseRepository;

    public List<Exercise> execute() {
        return exerciseRepository.findAll();
    }
}
