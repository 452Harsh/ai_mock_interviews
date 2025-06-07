import React from 'react'
import dayjs from 'dayjs';
import Image from 'next/image';
import { getRandomInterviewCover } from '@/lib/utils';
import Link from 'next/link';
import DisplayTechIcons from './DisplayTechIcons';
import { getFeedbackByInterviewId } from '@/lib/actions/general.action';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { Button } from './ui/button';

const InterviewCard = async ({id ,role,type, techstack,createdAt}:InterviewCardProps) => {
    const userId = await getCurrentUser();
    const i = userId?.id || "";
    const feedback = userId && id  ?
    await getFeedbackByInterviewId({   
        interviewId: id,
       userId: i,
    }) : null;
    console.log("feedback", feedback);
    console.log("userId" + userId?.id, id);
   
    const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
    const formatedDate = dayjs(feedback?.createdAt  || createdAt  || Date.now()).format("MMM D, YYYY");
  return (
    <div className='card-border w-[360px] max-sm:w-full min-h-96'>
        <div className='card-interview'>
            <div>
                <div className='absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600'>
                    <p className='badge-text'>{normalizedType}</p>
                </div>
                <Image src={getRandomInterviewCover()} width={90} height={90} alt='cover-image' className='object-fit rounded-full size-[90px]' />
                <h3 className='mt-5 capitalize'>{role} interview</h3>
                <div className='flex flex-row gap-5 mt-3'>
                    <div className='flex flex-row gap-2'>
                        <Image src='/calendar.svg' width={22} height={22} alt='calendar'/>
                        <p>{formatedDate}</p>
                    </div>
                    <div className='flex flex-row gap-2 items-center'> 
                        <Image height={22} width={22} src='/star.svg' alt='star'/>
                        <p>{feedback?.totalScore || '---'}/100</p>
                    </div>
                </div>
                <p className='line-clamp-2 mt-5'>{ feedback?.finalAssessment || "You haven't taken the interview yet.Take it now to improve your skill"}</p>
            </div>
            <div className='flex flex-row justify-between'>
                <DisplayTechIcons techstack={techstack} />
                <Button asChild className="btn-primary max-sm:w-full">
                    <Link className='' href={feedback ? `/interview/${id}/feedback` : `/interview/${id}`}>
                    {feedback ? "Check Feedback" : "View Interview"}
                </Link>
                </Button>
                
            </div>
        </div>
    </div>
  )
}

export default InterviewCard