package com.ugustavob.gogym.application.musclegroup.usecases;

import com.ugustavob.gogym.domain.entities.MuscleGroup;
import com.ugustavob.gogym.domain.repositories.MuscleGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetMuscleGroupByIdInteractor {
     private final MuscleGroupRepository repository;

     public MuscleGroup execute(Long id){
         return repository.findById(id)
                 .orElseThrow(() -> new RuntimeException("Grupo muscular não encontrado"));
     }
}
