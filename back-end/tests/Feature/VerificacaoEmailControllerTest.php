<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class VerificacaoEmailControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_verificar_email_com_sucesso()
    {
        $usuario = Usuario::factory()->unverified()->create();

        $hash = sha1($usuario->getEmailForVerification());

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $usuario->id, 'hash' => $hash]
        );

        // Extrai a query string e monta na url do frontend que a API recebe.
        $parsedUrl = parse_url($url);
        $apiUrl = '/api/email/verificar/' . $usuario->id . '/' . $hash . '?' . $parsedUrl['query'];

        $resposta = $this->getJson($apiUrl);

        $resposta->assertStatus(200)
            ->assertJsonPath('mensagem', 'E-mail verificado com sucesso!');

        $this->assertTrue($usuario->fresh()->hasVerifiedEmail());
    }

    public function test_verificar_email_ja_verificado()
    {
        $usuario = Usuario::factory()->create();

        $hash = sha1($usuario->getEmailForVerification());

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $usuario->id, 'hash' => $hash]
        );

        $parsedUrl = parse_url($url);
        $apiUrl = '/api/email/verificar/' . $usuario->id . '/' . $hash . '?' . $parsedUrl['query'];

        $resposta = $this->getJson($apiUrl);

        $resposta->assertStatus(200)
            ->assertJsonPath('mensagem', 'E-mail já verificado anteriormente.');
    }

    public function test_verificar_email_com_assinatura_invalida()
    {
        $usuario = Usuario::factory()->unverified()->create();
        $hash = sha1($usuario->getEmailForVerification());

        $apiUrl = '/api/email/verificar/' . $usuario->id . '/' . $hash . '?expires=123123123&signature=invalida';

        $resposta = $this->getJson($apiUrl);

        $resposta->assertStatus(403);
    }

    public function test_verificar_email_com_hash_invalido()
    {
        $usuario = Usuario::factory()->unverified()->create();

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $usuario->id, 'hash' => 'hash-errado']
        );

        $parsedUrl = parse_url($url);
        $apiUrl = '/api/email/verificar/' . $usuario->id . '/hash-errado?' . $parsedUrl['query'];

        $resposta = $this->getJson($apiUrl);

        $resposta->assertStatus(403)
            ->assertJsonPath('mensagem', 'Hash de verificação inválido.');
    }

    public function test_reenviar_verificacao_com_sucesso()
    {
        Notification::fake();

        $usuario = Usuario::factory()->unverified()->create();

        $resposta = $this->actingAs($usuario, 'sanctum')->postJson('/api/email/reenviar');

        $resposta->assertStatus(200)
            ->assertJsonPath('mensagem', 'E-mail de verificação reenviado.');
    }

    public function test_reenviar_verificacao_ja_verificado()
    {
        Notification::fake();

        $usuario = Usuario::factory()->create();

        $resposta = $this->actingAs($usuario, 'sanctum')->postJson('/api/email/reenviar');

        $resposta->assertStatus(422)
            ->assertJsonPath('mensagem', 'E-mail já verificado.');
    }
}
