import { isAuthenticated } from '@/lib/actions/auth.action'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React, { ReactNode } from 'react'

const RootLayout = async ({children}:{children:ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();
  if(!isUserAuthenticated) {
    redirect('/sign-in');
  }

  return (
    <div className='root-layout'>
      <nav>
        <Link className='flex gap-2 item-center' href="/">
          <Image src='/logo.svg' alt='logo' width={38} height={32}/>
          <h2 className='text-primary-100'>Prepwise</h2>
        </Link> 
      </nav>
      {children}
    </div>
  )
}

export default RootLayout