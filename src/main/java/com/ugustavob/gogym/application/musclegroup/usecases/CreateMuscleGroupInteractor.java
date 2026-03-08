package com.ugustavob.gogym.application.musclegroup.usecases;

import com.ugustavob.gogym.application.musclegroup.dto.CreateMuscleGroupRequestDTO;
import com.ugustavob.gogym.domain.entities.MuscleGroup;
import com.ugustavob.gogym.domain.repositories.MuscleGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateMuscleGroupInteractor {

    private final MuscleGroupRepository repository;

    public MuscleGroup execute(CreateMuscleGroupRequestDTO input){
        repository.findByName(input.name())
                .ifPresent(mg -> {
                    throw new RuntimeException("Grupo muscular já existe.");
                });

        MuscleGroup muscleGroup = new MuscleGroup();
        muscleGroup.setName(input.name());

        return repository.save(muscleGroup);
    }
}