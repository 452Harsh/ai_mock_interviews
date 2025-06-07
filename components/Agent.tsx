"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  CONNECTING = "CONNECTING",
  INACTIVE = "INACTIVE",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}
interface SavedMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const Agent = ({ userName, userId, type, questions ,interviewId }: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [message, setMessage] = useState<SavedMessage[]>([]);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessage((prev) => [...prev, newMessage]);
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.log("Error in call:", error);
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  const handleGenerateFeedback = async (message : SavedMessage[]) => {
    console.log("Generating feedback with messages:", message);
    const {success ,feedbackId : id } = await createFeedback({
      interviewId: interviewId || "",
      userId: userId || "",
      transcript: message,  
    })

    if(success && id){
      router.push(`/interview/${interviewId}/feedback`);
    }else{
      console.error("Failed to generate feedback");
      router.push('/');
    }
  }

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      if(type === "generate") {
        router.push("/"); 
      }
      else{
        handleGenerateFeedback(message);
      }
    }
  }, [message, userId, type, callStatus]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
    if (!workflowId) throw new Error("Missing VAPI workflow ID");

    if (type === "generate") {
      await vapi.start(undefined, undefined, undefined, workflowId, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    }else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }
      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
    
  };
  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };
  const lastMessage =
    message.length > 0 ? message[message.length - 1].content : "";
  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;
  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              width={65}
              height={54}
              alt="vapi"
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              width={540}
              height={540}
              alt="user avatar"
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>
      {lastMessage.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}
      <div className="w-full flex justify-center ">
        {callStatus !== "ACTIVE" ? (
          <button className="btn-call relative" onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75 ",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span>
              {isCallInactiveOrFinished ? "Start Interview" : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect " onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
