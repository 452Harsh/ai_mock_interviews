'use server';

import { db, auth } from "@/firebase/admin";
import { cookies } from "next/headers";

const oneWeek = 60 * 60 * 24 * 7; // 1 week in milliseconds

export async function signUp(parmas: SignUpParams) {
    const { uid, email, password, name } = parmas;
    try {
        const userRecord = await db.collection('users').doc(uid).get();
        if (userRecord.exists) {
            return {
                success: false,
                message: 'User already exists. Please log in instead.'
            }
        }
        await db.collection('users').doc(uid).set({
            email,
            name
        });
        return { 
            success: true,
            message: 'User signed up successfully.Please sign in to continue.'
        }

    } catch (e: any) {
        console.error('Error signing up:', e);
        if (e === 'auth/email-already-in-use') {
            return {
                success: false,
                message: 'Email already in use. Please use a different email address.'
            }
        }
        return {
            success: false,
            message: 'An error occurred during sign up. Please try again later.'
        }
    }

}

export async function signIn(params : SignInParams) {
    const {email,idToken} = params;
    try {
        const userRecord = await auth.getUserByEmail(email);
        if(!userRecord) {
            return {
                success: false,
                message: 'User not found. Please sign up first.'
            }
        }
        await setSessionCookie(idToken);
    } catch (e : any) {
        console.error('Error signing in:', e);
        return {
            success: false,
            message: 'An error occurred during sign in. Please try again later.'
        }  
    }
}

export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: oneWeek * 1000 });
    cookieStore.set('session',sessionCookie, {
        maxAge : oneWeek,
        httpOnly : true,
        secure : process.env.NODE_ENV === 'production',
        path : '/',
        sameSite: 'lax', // Adjust as necessary for your application
        }
    )
}

export async function getCurrentUser() : Promise<User | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) {
        return null;
    }
    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        const userRecord = await db.collection('users').doc(decodedClaims.uid).get();
        if (!userRecord.exists) {
            console.error('User not found in database:', decodedClaims.uid);
            return null;
        }
        return {
            ...userRecord.data(),
            id : userRecord.id,
        } as User;
    } catch (e: any) {
        console.error('Error verifying session cookie:', e);
        return null;
    }
}

export async function isAuthenticated() : Promise<boolean> {
    const user = await getCurrentUser();
    return !!user;
}