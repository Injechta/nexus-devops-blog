import { Card, CardContent } from '@/components/ui/card'

import ContactForm from '@/components/blocks/contact-us/contact-form'

const ContactUs = () => {
  return (
    <section className='bg-muted py-8 sm:py-16 lg:h-dvh lg:py-32'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mb-12 space-y-4 text-center sm:mb-16'>
          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Contacte Nexus DevOps pour plus d'informations</h2>
          <p className='text-muted-foreground text-xl'>
            Une question sur l'un de mes <strong>articles</strong> ? Un blocage technique sur tes pipelines CI/CD ou ton infrastructure Cloud ? 
  Je suis également disponible pour des missions de <strong>conseil et consulting</strong> pour t'aider à accélérer tes déploiements.
          </p>
        </div>

        <Card className='border-none shadow-none'>
          <CardContent className='grid gap-6 md:grid-cols-4 md:gap-12'>
            {/* Form Section */}
            <div className='md:col-span-2'>
              <ContactForm />
            </div>

            <div className='shadow-none md:col-span-2'>
              <img
                src='/images/hotlineNexus.png'
                alt='Image du Pinguin Nexus "Me Contacter"'
                className='size-full rounded-xl border object-cover max-md:max-h-70'
                loading='lazy'
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default ContactUs
