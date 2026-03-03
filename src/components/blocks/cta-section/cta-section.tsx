'use client'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const CTA = () => {
  // Fonction d'envoi vers ton API
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  const formData = new FormData(e.currentTarget);
  const email = formData.get('email');

  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // On précise qu'on envoie du JSON
      },
      body: JSON.stringify({ email }), // On transforme l'email en texte JSON
    });

    if (response.ok) {
  window.location.href = '/merci'; // Redirection bogosse
} else {
  alert("Oups, un petit souci technique.");
}
  } catch (err) {
    console.error("Erreur :", err);
  }
};

  return (
    <section className='bg-muted py-8 sm:py-16 lg:py-24' id='get-in-touch'>
      <div className='container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8'>
        <Card className='shadow-none'>
          <CardContent>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              {/* Left Column - Image */}
              <div className='relative h-64 sm:h-80 lg:h-auto'>
                <img
                  src='/images/logonexus1.png'
                  alt='La Forge Nexus DevOps'
                  className='h-full w-full rounded-lg object-cover'
                  loading='lazy'
                />
              </div>

              {/* Right Column - Content */}
              <Card className='bg-muted rounded-lg border-0 shadow-none'>
                <CardContent className='flex h-full flex-col justify-between gap-4'>
                  <h2 className='text-xl leading-tight font-semibold lg:text-2xl'>
                      Rejoins La Forge de <strong>Nexus DevOps</strong>
                  </h2>
                  <div>
                    <p className='text-muted-foreground mb-3 text-base'>
                      Ne manque aucun article sur <strong>les piliers du DevOps</strong><br />
                      Reçois-les directement afin que l'on forge ton infrastructure ensemble, pas à pas.
                    </p>
                    
                    {/* Formulaire connecté à handleSubmit */}
                    <form 
                      className='gap-3 py-1 max-sm:space-y-3 sm:flex sm:flex-row'
                      onSubmit={handleSubmit}
                    >
                      <Input 
                        name='email'
                        type='email' 
                        required 
                        placeholder='Ton adresse mail...' 
                        className='bg-background h-12 flex-1 text-base border-muted-foreground/20' 
                      />
                      <Button 
                        size='lg' 
                        className='h-12 px-8 text-base font-medium max-sm:w-full' 
                        type='submit'
                      >
                        À tout de suite !
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default CTA