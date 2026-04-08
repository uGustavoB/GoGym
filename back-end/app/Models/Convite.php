<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Convite extends Model
{
    protected $table = 'convites';
    protected $fillable = [
        'personal_id',
        'email',
        'token',
        'status',
    ];

    public function personal()
    {
        return $this->belongsTo(Personal::class);
    }
}
