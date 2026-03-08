package com.ugustavob.gogym.application.equipment.usecases;

import com.ugustavob.gogym.domain.entities.Equipment;
import com.ugustavob.gogym.domain.repositories.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetEquipmentsInteractor {
    private final EquipmentRepository repository;

    public List<Equipment> execute() {
        return repository.findAll();
    }
}