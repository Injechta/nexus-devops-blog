'use client'

import { useState } from 'react'
import { UserIcon, MailIcon, PhoneIcon, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        body: data, 
        // On ne met aucun header ici, le navigateur s'occupe de tout
      });

      if (response.ok) {
        window.location.href = "/thanks";
      } else {
        const errorData = await response.json();
        console.error("Détail erreur serveur :", errorData);
        alert("Erreur Serveur : " + (errorData.error?.message || "Problème d'envoi"));
      }
    } catch (error) {
      console.error("Erreur Fetch :", error); // Log l'erreur réelle
      alert("Le script d'envoi a échoué. Regarde la console (F12).");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className='space-y-6' onSubmit={handleSubmit}>
      {/* Name Input */}
      <div className='space-y-2'>
        <Label htmlFor='username'>Votre Nom</Label>
        <div className='relative'>
          <Input name='name' id='username' type='text' required placeholder='Entrez votre nom ici...' className='peer h-10 pr-9' />
          <div className='text-muted-foreground pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center pr-3 peer-disabled:opacity-50'>
            <UserIcon className='size-4' />
            <span className='sr-only'>Nom</span>
          </div>
        </div>
      </div>

      {/* Email Input */}
      <div className='space-y-2'>
        <Label htmlFor='email'>Votre Email</Label>
        <div className='relative'>
          <Input name='email' id='email' type='email' required placeholder='Entrez votre Email ici...' className='peer h-10 pr-9' />
          <div className='text-muted-foreground pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center pr-3 peer-disabled:opacity-50'>
            <MailIcon className='size-4' />
            <span className='sr-only'>Email</span>
          </div>
        </div>
      </div>

      {/* Phone Input */}
      <div className='space-y-2'>
        <Label htmlFor='phone'>Numéro De Téléphone</Label>
        <div className='relative'>
          <Input name='phone' id='phone' type='text' placeholder='Votre numéro de téléphone (optionnel)...' className='peer h-10 pr-9' />
          <div className='text-muted-foreground pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center pr-3 peer-disabled:opacity-50'>
            <PhoneIcon className='size-4' />
            <span className='sr-only'>Téléphone</span>
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className='space-y-2'>
        <Label htmlFor='message'>Message</Label>
        <Textarea name='message' id='message' className='h-28 resize-none' required placeholder='Rédigez votre message...' />
      </div>

      {/* Submit Button */}
      <Button type='submit' size='lg' className='w-full text-base' disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          "Envoyer votre message"
        )}
      </Button>
    </form>
  )
}

export default ContactForm