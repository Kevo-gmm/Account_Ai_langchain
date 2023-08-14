"use client";

import { useCompletion, useChat } from "ai/react";
import Image from "next/image";
import { useEffect, useState } from "react";

var last_name = "";

export default function QAModal({ open, setOpen, example }: { open: boolean; setOpen: any; example: any }) {
  const [prompts, setPrompts] = useState<{ input: string; completion: string }[]>([]);
  // Define state variables for the result, recording status, and media recorder
  const [result, setResult] = useState();
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();

  if (!example) {
    // create a dummy so the completion doesn't croak during init.
    example = new Object();
    example.llm = "";
    example.name = "";
  }
  let { completion, input, isLoading, handleInputChange, handleSubmit, stop, setInput, setCompletion, complete } = useCompletion({
    api: "/api/chatgpt",
    headers: { name: "Amigo" },
  });
  console.log("==================completion====================");
  console.log(completion);
  useEffect(() => {
    if (completion && input) {
      setPrompts(prev => [...prev, { completion, input }]);
      setInput("");
    }
  }, [completion]);
  // This array will hold the audio data
  let chunks: Blob[] = [];

  // This useEffect hook sets up the media recorder when the component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(stream => {
          const newMediaRecorder = new MediaRecorder(stream);
          newMediaRecorder.onstart = () => {
            chunks = [];
          };
          newMediaRecorder.ondataavailable = e => {
            chunks.push(e.data);
          };
          newMediaRecorder.onstop = async () => {
            const audioBlob = new Blob(chunks, { type: "audio/webm" });
            try {
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              reader.onloadend = async function () {
                if (typeof reader.result !== "string") return;
                const base64Audio = reader?.result?.split(",")[1]; // Remove the data URL prefix
                const response = await fetch("/api/whisper", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ audio: base64Audio }),
                });
                const data = await response.json();
                if (response.status !== 200) {
                  throw data.error || new Error(`Request failed with status ${response.status}`);
                }
                setInput(data.result);
                setResult(data.result);
                const res = await complete(data.result);
                console.log("=====================complete res========================");
                console.log(res);
              };
            } catch (error) {
              console.log("-----------------------an error occurred-----------------------------");
              console.error(error);
            }
          };
          setMediaRecorder(newMediaRecorder);
        })
        .catch(err => console.error("Error accessing microphone:", err));
    }
  }, []);
  console.log("=================RESULT=========================");
  console.log(result);
  const resetHandler = () => {
    setInput("");
    setPrompts([]);
  };

  if (!example) {
    console.log("ERROR: no companion selected");
    return null;
  }

  const handleMicClick = () => {
    console.log("===================clicked=====================");
    if (mediaRecorder) {
      mediaRecorder.start();
      setRecording(true);
    }
  };

  // Function to start recording
  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setRecording(true);
    }
  };
  // Function to stop recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  return (
    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 ">
      <div className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:p-6 w-full max-w-3xl">
        <div>
          <div className="mt-1 sm:mt-2 ">
            {prompts.length > 0 && (
              <div className="flex row justify-end items-center my-2">
                <svg
                  className="mx-2 h-5 w-5 flex-shrink-0 rounded-full"
                  width="0px"
                  height="0px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={resetHandler}
                >
                  <g fill="none" fillRule="evenodd" stroke="#fff" strokeLinecap="round" stroke-linejoin="round" transform="matrix(0 1 1 0 2.5 2.5)">
                    <path d="m3.98652376 1.07807068c-2.38377179 1.38514556-3.98652376 3.96636605-3.98652376 6.92192932 0 4.418278 3.581722 8 8 8s8-3.581722 8-8-3.581722-8-8-8" />

                    <path d="m4 1v4h-4" transform="matrix(1 0 0 -1 0 6)" />
                  </g>
                </svg>
              </div>
            )}
            {prompts.map((p, index) => {
              return (
                <div key={index} className="mt-2">
                  <div className="flex row items-start my-2">
                    <svg
                      className="mx-2 h-5 w-5 flex-shrink-0 rounded-full"
                      width="0px"
                      height="0px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="User / User_01">
                        <path
                          id="Vector"
                          d="M19 21C19 17.134 15.866 14 12 14C8.13401 14 5 17.134 5 21M12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7C16 9.20914 14.2091 11 12 11Z"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          stroke-linejoin="round"
                        />
                      </g>
                    </svg>
                    <p className="text-sm text-gray-200 pb-2">{p.input}</p>
                  </div>
                  <div className="flex row items-start">
                    <Image width={0} height={0} sizes="100vw" className="mx-2 h-6 w-6 flex-shrink-0 rounded-full" src={example.imageUrl} alt="" />
                    <p className="text-sm text-gray-200">{p.completion}</p>
                  </div>
                </div>
              );
            })}

            {isLoading && !completion && (
              <p className="flex items-center justify-center mt-4">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </p>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mt-2 mb-1">
              <p className="text-sm text-gray-500">Chat with {example.name}</p>
            </div>
            <div className="flex items-center relative">
              <input
                type="text"
                placeholder="How's your day?"
                className={
                  "w-full flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 shadow-sm focus:outline-none sm:text-sm sm:leading-6 " +
                  (isLoading && !completion ? "text-gray-600 cursor-not-allowed" : "text-white")
                }
                value={input}
                onChange={handleInputChange}
                disabled={isLoading && !completion}
              />

              <button>
                <svg
                  className="absolute right-2 h-6 w-7 rounded-full bg-blue-500 p-1 hover:cursor-pointer hover:bg-blue-600 sm:right-3 sm:top-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  width="0px"
                  height="0px"
                  viewBox="0 0 24 24"
                  version="1.1"
                  onClick={handleMicClick}
                >
                  <title>Mic</title>
                  <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g id="Mic">
                      <rect id="Rectangle" fill-rule="nonzero" x="0" y="0" width="24" height="24"></rect>
                      <rect id="Rectangle" stroke="#0C0310" stroke-width="2" stroke-linecap="round" x="9" y="3" width="6" height="11" rx="3"></rect>
                      <line x1="12" y1="18" x2="12" y2="21" id="Path" stroke="#0C0310" stroke-width="2" stroke-linecap="round"></line>
                      <line x1="8" y1="21" x2="16" y2="21" id="Path" stroke="#0C0310" stroke-width="2" stroke-linecap="round"></line>
                      <path
                        d="M19,11 C19,14.866 15.866,18 12,18 C8.13401,18 5,14.866 5,11"
                        id="Path"
                        stroke="#0C0310"
                        stroke-width="2"
                        stroke-linecap="round"
                      ></path>
                    </g>
                  </g>
                </svg>
              </button>
            </div>
          </form>
          <button onClick={recording ? stopRecording : startRecording}>{recording ? "Stop Recording" : "Start Recording"}</button>
        </div>
      </div>
    </div>
  );
}
