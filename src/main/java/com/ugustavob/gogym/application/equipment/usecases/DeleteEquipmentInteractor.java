package com.ugustavob.gogym.application.equipment.usecases;

import com.ugustavob.gogym.domain.entities.Equipment;
import com.ugustavob.gogym.domain.exception.EquipmentNotFoundException;
import com.ugustavob.gogym.domain.repositories.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeleteEquipmentInteractor {
    private final EquipmentRepository repository;

    public void execute(Long id) {
        Equipment equipment = repository.findById(id)
                .orElseThrow(EquipmentNotFoundException::new);
        repository.delete(equipment);
    }
}