import React, { ReactNode } from 'react'
import { Toaster } from 'sonner'

const authLayout = ({children} : {children : ReactNode}) => {
  return (
    <div className='auth-layout'>{children}</div>
   
  )
}

export default authLayout