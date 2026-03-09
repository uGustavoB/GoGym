package com.ugustavob.gogym.application.exercise.usecases;

import com.ugustavob.gogym.domain.entities.Exercise;
import com.ugustavob.gogym.domain.exception.ExerciseNotFoundException;
import com.ugustavob.gogym.domain.repositories.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetExerciseByIdInteractor {
    private final ExerciseRepository exerciseRepository;

    public Exercise execute(Long id) {
        return exerciseRepository.findById(id)
                .orElseThrow(ExerciseNotFoundException::new);
    }
}
