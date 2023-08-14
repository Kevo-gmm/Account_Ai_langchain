import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
import fs from "fs";
import { NextApiResponse, NextApiRequest } from "next";
import { tmpdir } from "os";
import { join } from "path";
import { NextResponse } from "next/server";

dotenv.config({ path: `.env.local` });

export async function POST(req: Request) {
  const { audio } = await req.json();
  if (!audio) return NextResponse.json({ error: "No audio file provided. Please provide an audio file to continue" }, { status: 500 });

  try {
    const audioBuffer = Buffer.from(audio, "base64"); // Decode base64 to buffer
    const tempFilePath = join(tmpdir(), `temp_audio_${Date.now()}.webm`); // Create temp file path
    fs.writeFileSync(tempFilePath, audioBuffer); // Write buffer to temp file

    const text = await convertAudioToText(tempFilePath);
    return NextResponse.json({ result: text }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "An error occurred during your request." }, { status: 500 });
  }
}

async function convertAudioToText(audioPath: string) {
  try {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    //@ts-ignore
    const response = await openai.createTranscription(fs.createReadStream(audioPath), "whisper-1");
    console.log("=================TEXT=========================");
    const transcribedText = response.data.text;
    console.log(transcribedText);
    return transcribedText;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}
