'use client'
import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import FormField from '@/components/FormField'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase/client'
import { signIn, signUp } from '@/lib/actions/auth.action'
import { sign } from 'crypto'




const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === 'sign-up' ? z.string().min(2).max(50) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8),
  })
}



const Authform = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const formSchema = authFormSchema(type)
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  // 2. Define a submit handler.
 async  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (type === 'sign-in') {
        // Handle sign-in logic
        const { email, password } = values;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idtoken = await userCredential.user.getIdToken();
        if(!idtoken) {
          toast.error('Failed to retrieve ID token. Please try again.');
          return;
        }
        await signIn({
          email,
          idToken: idtoken,
        });
        console.log('Sign in values:', values);
        toast.success('Sign in successful!');
        router.push('/'); // Redirect to Home after successful sign-in
      } else {
        // Handle sign-up logic
        const { name, email, password } = values;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        console.log('Sign up values:', values);
        const result = await signUp({
          uid : userCredential.user.uid,
          name : name!,
          email,
          password,
        })
        if(!result?.success) {
          toast.error(result?.message || 'Sign up failed. Please try again.');
          return;
        }

        toast.success('Sign up successful!');
        router.push('/sign-in'); // Redirect to sign-in page after successful sign-up
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error : ${error}`)

    }
  }

  const isSignIn = type === 'sign-in';
  return (
    <div className='card-border lg:min-w-[566px]'>
      <div className='flex flex-col gap-6 card py-14 px-10'>
        <div className='flex flex-row gap-2 justify-center'>
          <Image src='/logo.svg' height={32} width={38} alt='logo' />
        </div>
        <h3>Practise job interview with AI</h3>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="width-full space-y-6 mt-4 form">
            {!isSignIn && <FormField
              control={form.control}
              name="name" label='name'
              placeholder='Your Name'
            />
            }
           <FormField
              control={form.control}
              name="email" label='email'
              placeholder='Your email address' 
              type='email'
            />
            <FormField
              control={form.control}
              name="password" label='password'
              type='password'
              placeholder='Enter your password'
            />
            <Button className='btn' type="submit">{isSignIn ? 'Sign in' : 'Create an account'}</Button>
            <p className='text-center'>
              {isSignIn ? 'No account yet?' : 'Already have an account?'}
              <Link className='font-bold text-user-primary ml-1' href={!isSignIn ? '/sign-in' : '/sign-up'} >{!isSignIn ? "Sign in" : "Sign up"}</Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default Authform