package com.ugustavob.gogym.application.workout.usecases;

import com.ugustavob.gogym.application.workout.dto.UpdatePlannedSetRequestDTO;
import com.ugustavob.gogym.domain.entities.PlannedSet;
import com.ugustavob.gogym.domain.repositories.PlannedSetRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UpdatePlannedSetInteractor {

    private final PlannedSetRepository repository;

    @Transactional
    public PlannedSet execute(UpdatePlannedSetRequestDTO input) {
        PlannedSet set = repository.findById(input.setId())
                .orElseThrow(() -> new RuntimeException("Série não encontrada."));

        if (input.targetReps() != null) set.setTargetReps(input.targetReps());
        if (input.rir() != null) set.setRir(input.rir());
        if (input.restTimeSeconds() != null) set.setRestTimeSeconds(input.restTimeSeconds());
        if (input.setType() != null) set.setSetType(input.setType());

        return repository.save(set);
    }
}