"use client";

import { useCompletion } from "ai/react";
import Image from "next/image";
import { useEffect, useState } from "react";

var last_name = "";

export default function QAModal({ open, setOpen, example }: { open: boolean; setOpen: any; example: any }) {
  const [prompts, setPrompts] = useState<{ input: string; completion: string }[]>([]);
  if (!example) {
    // create a dummy so the completion doesn't croak during init.
    example = new Object();
    example.llm = "";
    example.name = "";
  }

  let { completion, input, isLoading, handleInputChange, handleSubmit, stop, setInput, setCompletion } = useCompletion({
    api: "/api/" + example.llm,
    headers: { name: example.name },
  });

  useEffect(() => {
    if (completion && input) {
      setPrompts(prev => [...prev, { completion, input }]);
      setInput("");
    }
  }, [completion]);

  const resetHandler = () => {
    setInput("");
    setPrompts([]);
  };

  if (!example) {
    console.log("ERROR: no companion selected");
    return null;
  }

  return (
    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:p-6 w-full max-w-3xl">
        <div>
          <div className="mt-1 sm:mt-2">
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
                  <g fill="none" fill-rule="evenodd" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" transform="matrix(0 1 1 0 2.5 2.5)">
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
                          stroke-linecap="round"
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
            <input
              placeholder="How's your day?"
              className={
                "w-full flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 shadow-sm focus:outline-none sm:text-sm sm:leading-6 " +
                (isLoading && !completion ? "text-gray-600 cursor-not-allowed" : "text-white")
              }
              value={input}
              onChange={handleInputChange}
              disabled={isLoading && !completion}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
