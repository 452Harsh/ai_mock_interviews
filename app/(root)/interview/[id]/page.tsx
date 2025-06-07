import Agent from '@/components/Agent';
import DisplayTechIcons from '@/components/DisplayTechIcons';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getInterviewById } from '@/lib/actions/general.action';
import { getRandomInterviewCover } from '@/lib/utils';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import React from 'react'

const page = async ({params} : RouteParams) => {
    const { id} = await params;
    const user = await getCurrentUser();
    const interview = await getInterviewById(id);
    if(!interview) {
        redirect('/interview');
    }
  return (
    <>
        <div className='flex flex-row gap-4 justify-between'>
            <div className='flex flex-row gap-4 items-center'>
                <div className='flex flex-row gap-4'>
                    <Image src={getRandomInterviewCover()} width={40} height={40} className='rounded-full object-cover size-[40px]' alt='cover-image'/>
                    <h3 className='capitalize'>{interview.role} interview</h3>
                </div>
                <DisplayTechIcons techStack={interview.techstack} />
            </div>
            <p className='bg-dark-200 rounded-lg px-4 py-2 h-fit capitalize'>{interview.type}</p>
        </div> 
        <Agent 
            userName={user?.name || 'Guest'}
            userId={user?.id} 
            interviewId={id}
            type='interview'
            questions={interview.questions}
        />

    </>
  )
}

export default page