import os
import subprocess
from pathlib import Path
from openai import OpenAI
from django.conf import settings

def extract_audio_from_video(video_path: str, output_audio_path: str) -> bool:
    """
    Extracts audio track from video files (.mp4, .mkv, .mov, .avi) and converts to 16kHz mono MP3.
    """
    try:
        command = [
            'ffmpeg',
            '-y',
            '-i', video_path,
            '-vn',
            '-ar', '16000',
            '-ac', '1',
            '-b:a', '32k',
            output_audio_path
        ]
        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return result.returncode == 0 and os.path.exists(output_audio_path)
    except FileNotFoundError:
        print("[Transcription Service]: ffmpeg is not installed or not available in PATH.")
        return False
    except Exception as e:
        print(f"[Transcription Service]: Audio extraction error: {e}")
        return False

def transcribe_audio(audio_file_path: str) -> str:
    """
    Transcribes audio using OpenAI Whisper API (whisper-1).
    """
    api_key = os.getenv("OPENAI_API_KEY") or getattr(settings, "OPENAI_API_KEY", "")
    
    if not api_key or api_key.startswith("your_") or len(api_key) < 10:
        raise ValueError("OPENAI_API_KEY is not configured. Please provide a valid OpenAI API Key in backend/.env to transcribe audio.")

    try:
        client = OpenAI(api_key=api_key)
        with open(audio_file_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text"
            )
        return str(transcript)
    except Exception as e:
        print(f"[Transcription Service]: Whisper transcription error: {e}")
        raise e
