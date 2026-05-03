<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Exercicio;

class ExerciseSeeder extends Seeder
{
    public function run(): void
    {
        $exercicios = [
            // Peitoral
            ['nome' => 'Supino reto com barra', 'tipo' => 'superior', 'grupo_muscular' => 'peitoral'],
            ['nome' => 'Supino reto com halteres', 'tipo' => 'superior', 'grupo_muscular' => 'peitoral'],
            ['nome' => 'Supino inclinado com barra', 'tipo' => 'superior', 'grupo_muscular' => 'peitoral'],
            ['nome' => 'Supino inclinado com halteres', 'tipo' => 'superior', 'grupo_muscular' => 'peitoral'],
            ['nome' => 'Supino declinado', 'tipo' => 'superior', 'grupo_muscular' => 'peitoral'],
            ['nome' => 'Crucifixo reto', 'tipo' => 'superior', 'grupo_muscular' => 'peitoral'],
            ['nome' => 'Crucifixo inclinado', 'tipo' => 'superior', 'grupo_muscular' => 'peitoral'],
            ['nome' => 'Crossover polia alta', 'tipo' => 'superior', 'grupo_muscular' => 'peitoral'],
            ['nome' => 'Crossover polia média', 'tipo' => 'superior', 'grupo_muscular' => 'peitoral'],
            ['nome' => 'Crossover polia baixa', 'tipo' => 'superior', 'grupo_muscular' => 'peitoral'],
            ['nome' => 'Voador (Peck Deck)', 'tipo' => 'superior', 'grupo_muscular' => 'peitoral'],
            ['nome' => 'Flexão de braços', 'tipo' => 'superior', 'grupo_muscular' => 'peitoral'],
            ['nome' => 'Flexão diamante', 'tipo' => 'superior', 'grupo_muscular' => 'peitoral'],
            ['nome' => 'Pullover com halter', 'tipo' => 'superior', 'grupo_muscular' => 'peitoral'],
            ['nome' => 'Supino articulado reto', 'tipo' => 'superior', 'grupo_muscular' => 'peitoral'],
            ['nome' => 'Supino articulado inclinado', 'tipo' => 'superior', 'grupo_muscular' => 'peitoral'],

            // Costas
            ['nome' => 'Puxada frontal (Pronada)', 'tipo' => 'superior', 'grupo_muscular' => 'costas'],
            ['nome' => 'Puxada frontal (Supinada)', 'tipo' => 'superior', 'grupo_muscular' => 'costas'],
            ['nome' => 'Puxada com triângulo', 'tipo' => 'superior', 'grupo_muscular' => 'costas'],
            ['nome' => 'Puxada atrás', 'tipo' => 'superior', 'grupo_muscular' => 'costas'],
            ['nome' => 'Remada curvada com barra', 'tipo' => 'superior', 'grupo_muscular' => 'costas'],
            ['nome' => 'Remada cavalinho', 'tipo' => 'superior', 'grupo_muscular' => 'costas'],
            ['nome' => 'Remada baixa na polia', 'tipo' => 'superior', 'grupo_muscular' => 'costas'],
            ['nome' => 'Remada unilateral (Serrote)', 'tipo' => 'superior', 'grupo_muscular' => 'costas'],
            ['nome' => 'Remada articulada', 'tipo' => 'superior', 'grupo_muscular' => 'costas'],
            ['nome' => 'Barra fixa (Pronada)', 'tipo' => 'superior', 'grupo_muscular' => 'costas'],
            ['nome' => 'Barra fixa (Supinada)', 'tipo' => 'superior', 'grupo_muscular' => 'costas'],
            ['nome' => 'Pulldown na polia', 'tipo' => 'superior', 'grupo_muscular' => 'costas'],
            ['nome' => 'Voador inverso (Crucifixo inverso)', 'tipo' => 'superior', 'grupo_muscular' => 'costas'],
            ['nome' => 'Levantamento terra', 'tipo' => 'superior', 'grupo_muscular' => 'costas'],
            ['nome' => 'Extensão lombar no banco', 'tipo' => 'superior', 'grupo_muscular' => 'costas'],

            // Ombros
            ['nome' => 'Desenvolvimento com halteres', 'tipo' => 'superior', 'grupo_muscular' => 'ombros'],
            ['nome' => 'Desenvolvimento com barra', 'tipo' => 'superior', 'grupo_muscular' => 'ombros'],
            ['nome' => 'Desenvolvimento no Smith', 'tipo' => 'superior', 'grupo_muscular' => 'ombros'],
            ['nome' => 'Desenvolvimento Arnold', 'tipo' => 'superior', 'grupo_muscular' => 'ombros'],
            ['nome' => 'Desenvolvimento articulado', 'tipo' => 'superior', 'grupo_muscular' => 'ombros'],
            ['nome' => 'Elevação lateral com halteres', 'tipo' => 'superior', 'grupo_muscular' => 'ombros'],
            ['nome' => 'Elevação lateral na polia', 'tipo' => 'superior', 'grupo_muscular' => 'ombros'],
            ['nome' => 'Elevação lateral máquina', 'tipo' => 'superior', 'grupo_muscular' => 'ombros'],
            ['nome' => 'Elevação frontal com halteres', 'tipo' => 'superior', 'grupo_muscular' => 'ombros'],
            ['nome' => 'Elevação frontal com anilha', 'tipo' => 'superior', 'grupo_muscular' => 'ombros'],
            ['nome' => 'Elevação frontal na polia', 'tipo' => 'superior', 'grupo_muscular' => 'ombros'],
            ['nome' => 'Crucifixo inverso com halteres', 'tipo' => 'superior', 'grupo_muscular' => 'ombros'],
            ['nome' => 'Face pull com corda', 'tipo' => 'superior', 'grupo_muscular' => 'ombros'],
            ['nome' => 'Remada alta com barra', 'tipo' => 'superior', 'grupo_muscular' => 'ombros'],
            ['nome' => 'Remada alta na polia', 'tipo' => 'superior', 'grupo_muscular' => 'ombros'],
            ['nome' => 'Encolhimento de ombros com halteres', 'tipo' => 'superior', 'grupo_muscular' => 'ombros'],
            ['nome' => 'Encolhimento de ombros com barra', 'tipo' => 'superior', 'grupo_muscular' => 'ombros'],

            // Biceps
            ['nome' => 'Rosca direta com barra', 'tipo' => 'superior', 'grupo_muscular' => 'biceps'],
            ['nome' => 'Rosca direta na polia', 'tipo' => 'superior', 'grupo_muscular' => 'biceps'],
            ['nome' => 'Rosca alternada com halteres', 'tipo' => 'superior', 'grupo_muscular' => 'biceps'],
            ['nome' => 'Rosca martelo com halteres', 'tipo' => 'superior', 'grupo_muscular' => 'biceps'],
            ['nome' => 'Rosca martelo na polia (corda)', 'tipo' => 'superior', 'grupo_muscular' => 'biceps'],
            ['nome' => 'Rosca scott com barra W', 'tipo' => 'superior', 'grupo_muscular' => 'biceps'],
            ['nome' => 'Rosca scott na máquina', 'tipo' => 'superior', 'grupo_muscular' => 'biceps'],
            ['nome' => 'Rosca concentrada com halter', 'tipo' => 'superior', 'grupo_muscular' => 'biceps'],
            ['nome' => 'Rosca simultânea inclinada', 'tipo' => 'superior', 'grupo_muscular' => 'biceps'],
            ['nome' => 'Rosca inversa com barra', 'tipo' => 'superior', 'grupo_muscular' => 'biceps'],
            ['nome' => 'Rosca aranha (Spider curl)', 'tipo' => 'superior', 'grupo_muscular' => 'biceps'],
            ['nome' => 'Rosca 21', 'tipo' => 'superior', 'grupo_muscular' => 'biceps'],

            // Triceps
            ['nome' => 'Tríceps na polia com barra', 'tipo' => 'superior', 'grupo_muscular' => 'triceps'],
            ['nome' => 'Tríceps na polia com corda', 'tipo' => 'superior', 'grupo_muscular' => 'triceps'],
            ['nome' => 'Tríceps testa com barra W', 'tipo' => 'superior', 'grupo_muscular' => 'triceps'],
            ['nome' => 'Tríceps testa com halteres', 'tipo' => 'superior', 'grupo_muscular' => 'triceps'],
            ['nome' => 'Tríceps francês unilateral', 'tipo' => 'superior', 'grupo_muscular' => 'triceps'],
            ['nome' => 'Tríceps francês bilateral (halter)', 'tipo' => 'superior', 'grupo_muscular' => 'triceps'],
            ['nome' => 'Tríceps francês na polia', 'tipo' => 'superior', 'grupo_muscular' => 'triceps'],
            ['nome' => 'Tríceps coice com halter', 'tipo' => 'superior', 'grupo_muscular' => 'triceps'],
            ['nome' => 'Tríceps coice na polia', 'tipo' => 'superior', 'grupo_muscular' => 'triceps'],
            ['nome' => 'Mergulho em paralelas', 'tipo' => 'superior', 'grupo_muscular' => 'triceps'],
            ['nome' => 'Tríceps banco', 'tipo' => 'superior', 'grupo_muscular' => 'triceps'],
            ['nome' => 'Supino fechado', 'tipo' => 'superior', 'grupo_muscular' => 'triceps'],
            ['nome' => 'Tríceps máquina', 'tipo' => 'superior', 'grupo_muscular' => 'triceps'],

            // Quadriceps
            ['nome' => 'Agachamento livre com barra', 'tipo' => 'inferior', 'grupo_muscular' => 'quadriceps'],
            ['nome' => 'Agachamento no Smith', 'tipo' => 'inferior', 'grupo_muscular' => 'quadriceps'],
            ['nome' => 'Agachamento frontal', 'tipo' => 'inferior', 'grupo_muscular' => 'quadriceps'],
            ['nome' => 'Agachamento búlgaro', 'tipo' => 'inferior', 'grupo_muscular' => 'quadriceps'],
            ['nome' => 'Agachamento Hack', 'tipo' => 'inferior', 'grupo_muscular' => 'quadriceps'],
            ['nome' => 'Leg press 45°', 'tipo' => 'inferior', 'grupo_muscular' => 'quadriceps'],
            ['nome' => 'Leg press horizontal', 'tipo' => 'inferior', 'grupo_muscular' => 'quadriceps'],
            ['nome' => 'Cadeira extensora', 'tipo' => 'inferior', 'grupo_muscular' => 'quadriceps'],
            ['nome' => 'Passada (Lunge) com halteres', 'tipo' => 'inferior', 'grupo_muscular' => 'quadriceps'],
            ['nome' => 'Passada com barra', 'tipo' => 'inferior', 'grupo_muscular' => 'quadriceps'],
            ['nome' => 'Agachamento sumô com halter', 'tipo' => 'inferior', 'grupo_muscular' => 'quadriceps'],
            ['nome' => 'Sissy squat', 'tipo' => 'inferior', 'grupo_muscular' => 'quadriceps'],

            // Posterior Coxa
            ['nome' => 'Mesa flexora', 'tipo' => 'inferior', 'grupo_muscular' => 'posterior_coxa'],
            ['nome' => 'Cadeira flexora', 'tipo' => 'inferior', 'grupo_muscular' => 'posterior_coxa'],
            ['nome' => 'Flexora em pé', 'tipo' => 'inferior', 'grupo_muscular' => 'posterior_coxa'],
            ['nome' => 'Stiff com barra', 'tipo' => 'inferior', 'grupo_muscular' => 'posterior_coxa'],
            ['nome' => 'Stiff com halteres', 'tipo' => 'inferior', 'grupo_muscular' => 'posterior_coxa'],
            ['nome' => 'Levantamento terra romeno (RDL)', 'tipo' => 'inferior', 'grupo_muscular' => 'posterior_coxa'],
            ['nome' => 'Flexão nórdica', 'tipo' => 'inferior', 'grupo_muscular' => 'posterior_coxa'],
            ['nome' => 'Bom dia (Good morning)', 'tipo' => 'inferior', 'grupo_muscular' => 'posterior_coxa'],

            // Gluteos
            ['nome' => 'Elevação pélvica com barra', 'tipo' => 'inferior', 'grupo_muscular' => 'gluteos'],
            ['nome' => 'Elevação pélvica máquina', 'tipo' => 'inferior', 'grupo_muscular' => 'gluteos'],
            ['nome' => 'Glúteo 4 apoios com caneleira', 'tipo' => 'inferior', 'grupo_muscular' => 'gluteos'],
            ['nome' => 'Glúteo na polia (Coice)', 'tipo' => 'inferior', 'grupo_muscular' => 'gluteos'],
            ['nome' => 'Cadeira abdutora', 'tipo' => 'inferior', 'grupo_muscular' => 'gluteos'],
            ['nome' => 'Abdução de quadril na polia', 'tipo' => 'inferior', 'grupo_muscular' => 'gluteos'],
            ['nome' => 'Subida no banco (Step up)', 'tipo' => 'inferior', 'grupo_muscular' => 'gluteos'],

            // Panturrilhas
            ['nome' => 'Gêmeos em pé (Máquina)', 'tipo' => 'inferior', 'grupo_muscular' => 'panturrilhas'],
            ['nome' => 'Gêmeos sentado (Máquina)', 'tipo' => 'inferior', 'grupo_muscular' => 'panturrilhas'],
            ['nome' => 'Gêmeos no Leg Press', 'tipo' => 'inferior', 'grupo_muscular' => 'panturrilhas'],
            ['nome' => 'Gêmeos no Smith', 'tipo' => 'inferior', 'grupo_muscular' => 'panturrilhas'],
            ['nome' => 'Panturrilha unilateral com halter', 'tipo' => 'inferior', 'grupo_muscular' => 'panturrilhas'],

            // Abdomen
            ['nome' => 'Abdominal reto (Crunch)', 'tipo' => 'core', 'grupo_muscular' => 'abdomen'],
            ['nome' => 'Abdominal infra (Elevação de pernas)', 'tipo' => 'core', 'grupo_muscular' => 'abdomen'],
            ['nome' => 'Abdominal infra pendurado na barra', 'tipo' => 'core', 'grupo_muscular' => 'abdomen'],
            ['nome' => 'Abdominal oblíquo no solo', 'tipo' => 'core', 'grupo_muscular' => 'abdomen'],
            ['nome' => 'Prancha isométrica', 'tipo' => 'core', 'grupo_muscular' => 'abdomen'],
            ['nome' => 'Prancha lateral', 'tipo' => 'core', 'grupo_muscular' => 'abdomen'],
            ['nome' => 'Roda abdominal (Ab wheel)', 'tipo' => 'core', 'grupo_muscular' => 'abdomen'],
            ['nome' => 'Abdominal supra na polia', 'tipo' => 'core', 'grupo_muscular' => 'abdomen'],
            ['nome' => 'Abdominal declinado', 'tipo' => 'core', 'grupo_muscular' => 'abdomen'],
            ['nome' => 'Twist russo com peso', 'tipo' => 'core', 'grupo_muscular' => 'abdomen'],
            ['nome' => 'Abdominal remador', 'tipo' => 'core', 'grupo_muscular' => 'abdomen'],
            ['nome' => 'Abdominal canivete (V-up)', 'tipo' => 'core', 'grupo_muscular' => 'abdomen'],

            // Outro (Cardio, Full Body)
            ['nome' => 'Esteira (Corrida/Caminhada)', 'tipo' => 'cardio', 'grupo_muscular' => 'outro'],
            ['nome' => 'Bicicleta ergométrica', 'tipo' => 'cardio', 'grupo_muscular' => 'outro'],
            ['nome' => 'Bicicleta de spinning', 'tipo' => 'cardio', 'grupo_muscular' => 'outro'],
            ['nome' => 'Elíptico (Transport)', 'tipo' => 'cardio', 'grupo_muscular' => 'outro'],
            ['nome' => 'Remo seco', 'tipo' => 'cardio', 'grupo_muscular' => 'outro'],
            ['nome' => 'Pular corda', 'tipo' => 'cardio', 'grupo_muscular' => 'outro'],
            ['nome' => 'Escada ergométrica', 'tipo' => 'cardio', 'grupo_muscular' => 'outro'],
            ['nome' => 'Burpee', 'tipo' => 'full_body', 'grupo_muscular' => 'outro'],
            ['nome' => 'Kettlebell swing', 'tipo' => 'full_body', 'grupo_muscular' => 'outro'],
            ['nome' => 'Arremesso (Clean and jerk)', 'tipo' => 'full_body', 'grupo_muscular' => 'outro'],
            ['nome' => 'Snatch (Arranco)', 'tipo' => 'full_body', 'grupo_muscular' => 'outro'],
            ['nome' => 'Thruster com barra', 'tipo' => 'full_body', 'grupo_muscular' => 'outro'],
            ['nome' => 'Man maker', 'tipo' => 'full_body', 'grupo_muscular' => 'outro'],
            ['nome' => 'Wall ball', 'tipo' => 'full_body', 'grupo_muscular' => 'outro'],
            ['nome' => 'Box jump (Salto na caixa)', 'tipo' => 'full_body', 'grupo_muscular' => 'outro'],
        ];

        foreach ($exercicios as $ex) {
            Exercicio::create(array_merge($ex, [
                'personal_id' => null,
                'video_url' => null,
                'instrucoes' => null,
            ]));
        }
    }
}
