package com.ugustavob.gogym.application.exercise.controller;

import com.ugustavob.gogym.application.exercise.dto.CreateExerciseRequestDTO;
import com.ugustavob.gogym.application.exercise.dto.UpdateExerciseRequestDTO;
import com.ugustavob.gogym.application.exercise.usecases.*;
import com.ugustavob.gogym.domain.entities.Exercise;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ExerciseController {
    private final GetAllExercisesInteractor getAllExercisesInteractor;
    private final GetExerciseByIdInteractor getExerciseByIdInteractor;
    private final CreateExerciseInteractor createExerciseInteractor;
    private final UpdateExerciseInteractor updateExerciseInteractor;
    private final DeleteExerciseInteractor deleteExerciseInteractor;

    @QueryMapping()
    public List<Exercise> exercises() {
        return getAllExercisesInteractor.execute();
    }

    @QueryMapping
    public Exercise exerciseById(@Argument Long id) {
        return getExerciseByIdInteractor.execute(id);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Exercise createExercise(@Valid @Argument CreateExerciseRequestDTO input) {
        return createExerciseInteractor.execute(input);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Exercise updateExercise(@Valid @Argument UpdateExerciseRequestDTO input) {
        return updateExerciseInteractor.execute(input);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean deleteExercise(@Argument Long id) {
        deleteExerciseInteractor.execute(id);
        return true;
    }
}
