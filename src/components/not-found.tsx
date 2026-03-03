import { Button } from '@/components/ui/button'

import Icon404 from '@/assets/svg/404'

const NotFound = () => {
  return (
    <div className='flex h-screen flex-col items-center justify-center gap-9 p-6'>
      <Icon404 className='h-auto w-full sm:h-120 sm:w-146' />
      <div className='flex flex-col items-center gap-4 text-center'>
        <p className='text-muted-foreground text-xl sm:text-2xl'>OUPS! <br /> Nous ne trouvons pas la page que vous demandez.</p>
        <Button size='lg' asChild>
          <a href='/'>Retourner à l'accueil</a>
        </Button>
      </div>
    </div>
  )
}

export default NotFound
