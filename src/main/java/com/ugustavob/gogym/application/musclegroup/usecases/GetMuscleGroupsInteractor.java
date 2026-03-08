package com.ugustavob.gogym.application.musclegroup.usecases;

import com.ugustavob.gogym.domain.entities.MuscleGroup;
import com.ugustavob.gogym.domain.repositories.MuscleGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetMuscleGroupsInteractor {

    private final MuscleGroupRepository repository;

    public List<MuscleGroup> execute(){
        return repository.findAll();
    }
}