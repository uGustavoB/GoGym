<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ConviteAlunoNotification extends Notification implements ShouldQueue
{
    use Queueable;

    private $nomeAluno;
    private $nomePersonal;
    private $email;
    private $token;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $nomeAluno, string $nomePersonal, string $email, string $token)
    {
        $this->nomeAluno = $nomeAluno;
        $this->nomePersonal = $nomePersonal;
        $this->email = $email;
        $this->token = $token;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:3000'), '/');
        
        $url = "{$frontendUrl}/registrar?tipo=aluno&token_convite={$this->token}&email=" . urlencode($this->email);

        return (new MailMessage)
            ->subject('Convite para participar do ' . config('app.name'))
            ->greeting('Olá, ' . $this->nomeAluno . '!')
            ->line("Você foi convidado(a) por {$this->nomePersonal} para se tornar aluno(a) no aplicativo " . config('app.name') . ".")
            ->line('Clique no botão abaixo para criar sua conta e aceitar o convite automaticamente:')
            ->action('Aceitar Convite e Cadastrar', $url)
            ->line('Se você não esperava por esse convite, pode ignorar este e-mail placidamente.')
            ->salutation('Atenciosamente, Equipe ' . config('app.name'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
