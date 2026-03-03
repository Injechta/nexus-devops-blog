import { Resend } from 'resend';
import type { APIRoute } from 'astro';

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.formData();
    const name = body.get('name') as string;
    const email = body.get('email') as string;
    const message = body.get('message') as string;

    const { data, error } = await resend.emails.send({
      //  REMPLACÉ : Utilise ton domaine validé
      from: 'Forge Nexus DevOps<contact@nexus-devops.fr>', 
      
      //  REMPLACÉ : Ton adresse mail de domaine perso
      to: ['gregory.elbajoury@nexus-devops.fr'], 
      
      //  AJOUTÉ : Permet de répondre directement à l'expéditeur en un clic
      replyTo: email, 
      
      subject: `🛠️ Nouveau message de la Forge : ${name}`,
      html: `
        <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #2563eb;">Nouveau message reçu depuis nexus-devops.fr</h2>
          <p><strong>Expéditeur :</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p><strong>Message :</strong></p>
          <p style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
            ${message}
          </p>
        </div>
      `,
    });

    if (error) {
      return new Response(JSON.stringify({ error }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Détail de l'erreur Resend :", error); 
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}