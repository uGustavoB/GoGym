<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;

class VerificarEmailNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected int $expiracao = 60; // Minutos

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
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
        $url = $this->gerarUrl($notifiable);

        return (new MailMessage)
            ->subject('Confirme seu endereço de e-mail')
            ->greeting('Olá, ' . $notifiable->nome . '!')
            ->line('Clique no botão abaixo para verificar seu endereço de e-mail.')
            ->action('Verificar E-mail', $url)
            ->line("Este link expira em {$this->expiracao} minutos.")
            ->line('Se você não criou uma conta, nenhuma ação é necessária.')
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

    protected function gerarUrl(object $notifiable): string
    {
        $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:3000'), '/');

        $id = $notifiable->getKey();
        $hash = sha1($notifiable->getEmailForVerification());
        $expires = Carbon::now()->addMinutes($this->expiracao)->getTimestamp();
        
        // Assinatura via token estrito que não depende do host ou schema da requisição web, escapando as barreiras de proxy do Docker
        $signature = hash_hmac('sha256', "{$id}|{$hash}|{$expires}", config('app.key'));

        return "{$frontendUrl}/verificar-email/callback?id={$id}&hash={$hash}&expires={$expires}&signature={$signature}";
    }
}
