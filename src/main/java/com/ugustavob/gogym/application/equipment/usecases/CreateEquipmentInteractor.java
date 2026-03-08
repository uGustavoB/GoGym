package com.ugustavob.gogym.application.equipment.usecases;

import com.ugustavob.gogym.application.equipment.dto.CreateEquipmentRequestDTO;
import com.ugustavob.gogym.domain.entities.Equipment;
import com.ugustavob.gogym.domain.exception.ConflictException;
import com.ugustavob.gogym.domain.repositories.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateEquipmentInteractor {

    private final EquipmentRepository repository;

    public Equipment execute(CreateEquipmentRequestDTO input) {
        repository.findByNameIgnoreCase(input.name())
                .ifPresent(eq -> {
                    throw new ConflictException("Já existe um equipamento cadastrado com este nome.");
                });

        Equipment equipment = new Equipment();
        equipment.setName(input.name());
        equipment.setType(input.type());

        return repository.save(equipment);
    }
}