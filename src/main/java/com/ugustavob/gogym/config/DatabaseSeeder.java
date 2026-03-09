package com.ugustavob.gogym.config;

import com.ugustavob.gogym.domain.entities.Equipment;
import com.ugustavob.gogym.domain.entities.Exercise;
import com.ugustavob.gogym.domain.entities.MuscleGroup;
import com.ugustavob.gogym.domain.entities.UserEntity;
import com.ugustavob.gogym.domain.enums.EquipmentType;
import com.ugustavob.gogym.domain.repositories.EquipmentRepository;
import com.ugustavob.gogym.domain.repositories.ExerciseRepository;
import com.ugustavob.gogym.domain.repositories.MuscleGroupRepository;
import com.ugustavob.gogym.domain.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class DatabaseSeeder {

    private final MuscleGroupRepository muscleGroupRepository;
    private final EquipmentRepository equipmentRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedDatabase() {
        return args -> {
            seedAdmin();
            seedMuscleGroups();
            seedEquipments();
            seedExercises();

        };
    }

    private void seedAdmin() {

        if(userRepository.findByEmail("admin@example.com").isEmpty()) {

            UserEntity admin = new UserEntity();
            admin.setName("Administrador");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("1234"));
            admin.setRoles(Set.of("ADMIN"));

            userRepository.save(admin);

        }

    }

    private void seedMuscleGroups() {

        if(muscleGroupRepository.count() == 0) {
            MuscleGroup peito = new MuscleGroup();
            peito.setName("Peito");

            MuscleGroup costas = new MuscleGroup();
            costas.setName("Costas");

            muscleGroupRepository.save(peito);
            muscleGroupRepository.save(costas);
        }

    }

    private void seedEquipments() {

        if(equipmentRepository.count() == 0) {
            Equipment barra = new Equipment();
            barra.setName("Barra Olímpica");
            barra.setType(EquipmentType.FREE_WEIGHT);

            Equipment polia = new Equipment();
            polia.setName("Máquina de Polia");
            polia.setType(EquipmentType.MACHINE);

            equipmentRepository.save(barra);
            equipmentRepository.save(polia);

        }

    }

    private void seedExercises() {

        if(exerciseRepository.count() == 0) {

            MuscleGroup peito = muscleGroupRepository.findByName("Peito").orElseThrow();
            MuscleGroup costas = muscleGroupRepository.findByName("Costas").orElseThrow();

            Equipment barra = equipmentRepository.findByName("Barra Olímpica").orElseThrow();
            Equipment polia = equipmentRepository.findByName("Máquina de Polia").orElseThrow();

            exerciseRepository.save(
                    new Exercise(null, "Supino Reto com Barra", peito, barra)
            );

            exerciseRepository.save(
                    new Exercise(null, "Puxada Frontal", costas, polia)
            );

        }

    }

}