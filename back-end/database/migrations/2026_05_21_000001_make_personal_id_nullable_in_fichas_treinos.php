<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE fichas_treinos DROP FOREIGN KEY fichas_treinos_personal_id_foreign');
        DB::statement('ALTER TABLE fichas_treinos MODIFY personal_id BIGINT UNSIGNED NULL');
        DB::statement('ALTER TABLE fichas_treinos ADD CONSTRAINT fichas_treinos_personal_id_foreign FOREIGN KEY (personal_id) REFERENCES personais(id) ON DELETE SET NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE fichas_treinos DROP FOREIGN KEY fichas_treinos_personal_id_foreign');
        DB::statement('ALTER TABLE fichas_treinos MODIFY personal_id BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE fichas_treinos ADD CONSTRAINT fichas_treinos_personal_id_foreign FOREIGN KEY (personal_id) REFERENCES personais(id) ON DELETE CASCADE');
    }
};
