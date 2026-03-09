package com.ugustavob.gogym.application.musclegroup.controller;

import com.ugustavob.gogym.application.musclegroup.dto.CreateMuscleGroupRequestDTO;
import com.ugustavob.gogym.application.musclegroup.dto.UpdateMuscleGroupRequestDTO;
import com.ugustavob.gogym.application.musclegroup.usecases.*;
import com.ugustavob.gogym.domain.entities.MuscleGroup;
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
public class MuscleGroupController {

    private final CreateMuscleGroupInteractor createInteractor;
    private final GetMuscleGroupsInteractor getInteractor;
    private final GetMuscleGroupByIdInteractor getByIdInteractor;
    private final UpdateMuscleGroupInteractor updateInteractor;
    private final DeleteMuscleGroupInteractor deleteInteractor;

    @QueryMapping
    public List<MuscleGroup> muscleGroups(){
        return getInteractor.execute();
    }
    
    @QueryMapping
    public MuscleGroup muscleGroupById(
            @Argument Long id
    ){
        return getByIdInteractor.execute(id);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public MuscleGroup createMuscleGroup(
            @Valid @Argument CreateMuscleGroupRequestDTO input
    ){
        return createInteractor.execute(input);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public MuscleGroup updateMuscleGroup(@Valid @Argument UpdateMuscleGroupRequestDTO input) {
        return updateInteractor.execute(input);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean deleteMuscleGroup(@Argument Long id) {
        deleteInteractor.execute(id);
        return true;
    }
}
