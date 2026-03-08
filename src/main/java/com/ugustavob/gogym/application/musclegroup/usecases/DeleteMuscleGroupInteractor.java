package com.ugustavob.gogym.application.musclegroup.usecases;

import com.ugustavob.gogym.domain.entities.MuscleGroup;
import com.ugustavob.gogym.domain.repositories.MuscleGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeleteMuscleGroupInteractor {
    private final MuscleGroupRepository repository;

    public void execute(Long id){
        MuscleGroup muscleGroup = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grupo muscular não encontrado."));

        repository.delete(muscleGroup);
    }
}
