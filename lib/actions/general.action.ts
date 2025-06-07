'use server';

import { db, auth } from "@/firebase/admin";
export async function getInterviewByUserId(userId:string) : Promise<Interview[] | null> {
    const interview = await db.collection('interviews').where('UserId', '==', userId).orderBy('createdAt','desc').get();
    return interview.docs.map((doc) => ({id : doc.id, ...doc.data()}) ) as Interview[];
}
export async function getLateshInterview(params :GetLatestInterviewsParams) : Promise<Interview[] | null> {
    const { userId , limit = 20 } = params;

    const interview = await db.collection('interviews').where('finalized','==',true).where('UserId', '!=', userId).orderBy('createdAt','desc').limit(limit).get();
    return interview.docs.map((doc) => ({id : doc.id, ...doc.data()}) ) as Interview[];
}

export async function getInterviewById(id:string) : Promise<Interview| null> {
    const interview = await db.collection('interviews').doc(id).get();
    return interview.data() as Interview| null;
}