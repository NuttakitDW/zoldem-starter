import { useRef, useCallback, useEffect, useState } from 'react'

interface AudioOptions {
  volume?: number
  loop?: boolean
  preload?: boolean
}

export const useAudio = (src: string, options: AudioOptions = {}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const audio = new Audio(src)
    audio.volume = options.volume ?? 1
    audio.loop = options.loop ?? false
    audio.preload = options.preload ? 'auto' : 'none'

    audio.addEventListener('loadeddata', () => setIsLoaded(true))
    audio.addEventListener('play', () => setIsPlaying(true))
    audio.addEventListener('pause', () => setIsPlaying(false))
    audio.addEventListener('ended', () => setIsPlaying(false))

    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [src, options.volume, options.loop, options.preload])

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(console.error)
    }
  }, [])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  return {
    play,
    pause,
    stop,
    isPlaying,
    isLoaded
  }
}

export const useSoundEffect = (src: string, volume = 0.7) => {
  return useAudio(src, { volume, preload: true })
}

export const useBackgroundMusic = (src: string, volume = 0.3) => {
  return useAudio(src, { volume, loop: true, preload: true })
}