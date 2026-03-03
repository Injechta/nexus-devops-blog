export const prerender = false;

import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const email = body.email;

    if (!email) {
      return new Response(JSON.stringify({ message: 'Email manquant' }), { status: 400 });
    }

    // 1. Inscription dans l'audience (ce que tu as déjà fait)
    await resend.contacts.create({
      email: email,
      unsubscribed: false,
      audienceId: 'ddb81113-c9b3-451e-8278-d3e07525b70d', 
    });

    // 2. ENVOI DU MAIL DE BIENVENUE (Ajout stratégique)
    await resend.emails.send({
      from: 'La Forge Nexus <newsletter@nexus-devops.fr>', // Ton domaine validé
      to: email,
      subject: 'Bienvenue dans la Forge Nexus DevOps ! 🐧',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h1>Salut !</h1>
          <p>L'inscription à la <strong>Forge Nexus</strong> est confirmée.</p>
          <p>Tu recevras bientôt mes partages d'expérience sur Docker, Kubernetes et Astro.</p>
          <p>À très vite,</p>
          <p><strong>Grégory</strong></p>
        </div>
      `
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Erreur Subscribe/Send:", error);
    return new Response(JSON.stringify({ message: 'Erreur lors du traitement' }), { status: 500 });
  }
};