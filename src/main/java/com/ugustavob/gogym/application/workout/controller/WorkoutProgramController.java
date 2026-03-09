package com.ugustavob.gogym.application.workout.controller;

import com.ugustavob.gogym.application.workout.dto.CreateWorkoutProgramRequestDTO;
import com.ugustavob.gogym.application.workout.usecases.CreateWorkoutProgramInteractor;
import com.ugustavob.gogym.domain.entities.WorkoutProgram;
import com.ugustavob.gogym.domain.repositories.WorkoutProgramRepository;
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
public class WorkoutProgramController {

    private final CreateWorkoutProgramInteractor createInteractor;
    private final WorkoutProgramRepository repository; // Usando direto aqui só para a query simples

    @QueryMapping
    public List<WorkoutProgram> workoutProgramsByUserId(@Argument Long userId) {
        return repository.findByUserId(userId);
    }

    @MutationMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public WorkoutProgram createWorkoutProgram(@Valid @Argument CreateWorkoutProgramRequestDTO input) {
        return createInteractor.execute(input);
    }
}