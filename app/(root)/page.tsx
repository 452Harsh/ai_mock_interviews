import InterviewCard from "@/components/InterviewCard";
import { Button } from "@/components/ui/button";
import { dummyInterviews } from "@/constants";
import {
  getInterviewByUserId,
  getLateshInterview,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const page = async () => {
  const user = await getCurrentUser();
  console.log(user!.id);
  const [userInterview, latestInterview] = await Promise.all([
    await getInterviewByUserId(user?.id!),
    await getLateshInterview({ userId: user?.id! }),
  ]);

  console.log(userInterview, latestInterview);

  const hasPastInterview = userInterview && userInterview.length > 0;
  const hasUpcomingInterview = latestInterview && latestInterview.length > 0;
  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview ready with AI-Powered Practise and Feedback</h2>
          <p className="text-lg">
            Practise on real interview question & get instant feedback
          </p>
          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an interview</Link>
          </Button>
        </div>
        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>
      <section className="flex flex-col gap-6 mt-8">
        <h2>Your interview</h2>
        <div className="interviews-section">
          {hasPastInterview ? (
            userInterview?.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p>you haven't taken any interview yet</p>
          )}
        </div>
      </section>
      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an interview</h2>
        <div className="interviews-section">
          {hasUpcomingInterview ? (
            latestInterview.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p>There are no new interview available. </p>
          )}
        </div>
      </section>
    </>
  );
};

export default page;
