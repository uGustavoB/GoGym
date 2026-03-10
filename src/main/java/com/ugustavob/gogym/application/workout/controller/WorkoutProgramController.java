package com.ugustavob.gogym.application.workout.controller;

import com.ugustavob.gogym.application.workout.dto.CreateWorkoutExerciseRequestDTO;
import com.ugustavob.gogym.application.workout.dto.CreateWorkoutProgramRequestDTO;
import com.ugustavob.gogym.application.workout.dto.UpdatePlannedSetRequestDTO;
import com.ugustavob.gogym.application.workout.dto.UpdateWorkoutProgramDetailsRequestDTO;
import com.ugustavob.gogym.application.workout.usecases.AddExerciseToWorkoutInteractor;
import com.ugustavob.gogym.application.workout.usecases.CreateWorkoutProgramInteractor;
import com.ugustavob.gogym.application.workout.usecases.UpdatePlannedSetInteractor;
import com.ugustavob.gogym.application.workout.usecases.UpdateWorkoutProgramDetailsInteractor;
import com.ugustavob.gogym.domain.entities.PlannedSet;
import com.ugustavob.gogym.domain.entities.WorkoutExercise;
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
    private final WorkoutProgramRepository repository;
    private final UpdateWorkoutProgramDetailsInteractor updateDetailsInteractor;
    private final UpdatePlannedSetInteractor updatePlannedSetInteractor;
    private final AddExerciseToWorkoutInteractor addExerciseInteractor;

    @QueryMapping
    public List<WorkoutProgram> workoutProgramsByUserId(@Argument Long userId) {
        return repository.findByUserId(userId);
    }

    @MutationMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public WorkoutProgram createWorkoutProgram(@Valid @Argument CreateWorkoutProgramRequestDTO input) {
        return createInteractor.execute(input);
    }

    @MutationMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public WorkoutProgram updateWorkoutProgramDetails(@Valid @Argument UpdateWorkoutProgramDetailsRequestDTO input) {
        return updateDetailsInteractor.execute(input);
    }

    @MutationMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public PlannedSet updatePlannedSet(@Valid @Argument UpdatePlannedSetRequestDTO input) {
        return updatePlannedSetInteractor.execute(input);
    }

    @MutationMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public WorkoutExercise addExerciseToWorkout(
            @Argument Long workoutId,
            @Valid @Argument CreateWorkoutExerciseRequestDTO input) {
        return addExerciseInteractor.execute(workoutId, input);
    }
}