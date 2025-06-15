import { createContext, useContext, useState, type ReactNode } from 'react'
import { useBackgroundMusic, useSoundEffect } from '../hooks/useAudio'

interface AudioContextType {
  isMuted: boolean
  musicVolume: number
  sfxVolume: number
  toggleMute: () => void
  setMusicVolume: (volume: number) => void
  setSfxVolume: (volume: number) => void
  playCardDeal: () => void
  playChipMove: () => void
  playButtonClick: () => void
  playPlayerJoin: () => void
  playCardFlip: () => void
  startBackgroundMusic: () => void
  stopBackgroundMusic: () => void
}

const AudioContext = createContext<AudioContextType | null>(null)

export const useAudioContext = () => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudioContext must be used within AudioProvider')
  }
  return context
}

interface AudioProviderProps {
  children: ReactNode
}

export const AudioProvider = ({ children }: AudioProviderProps) => {
  const [isMuted, setIsMuted] = useState(false)
  const [musicVolume, setMusicVolumeState] = useState(0.3)
  const [sfxVolume, setSfxVolumeState] = useState(0.7)

  // Background music - placeholder URLs for now
  const backgroundMusic = useBackgroundMusic('/sounds/background-music.mp3', isMuted ? 0 : musicVolume)

  // Sound effects - placeholder URLs for now  
  const cardDealSound = useSoundEffect('/sounds/card-deal.mp3', isMuted ? 0 : sfxVolume)
  const chipMoveSound = useSoundEffect('/sounds/chip-move.mp3', isMuted ? 0 : sfxVolume)
  const buttonClickSound = useSoundEffect('/sounds/button-click.mp3', isMuted ? 0 : sfxVolume)
  const playerJoinSound = useSoundEffect('/sounds/player-join.mp3', isMuted ? 0 : sfxVolume)
  const cardFlipSound = useSoundEffect('/sounds/card-flip.mp3', isMuted ? 0 : sfxVolume)

  const toggleMute = () => setIsMuted(!isMuted)

  const setMusicVolume = (volume: number) => {
    setMusicVolumeState(volume)
  }

  const setSfxVolume = (volume: number) => {
    setSfxVolumeState(volume)
  }

  const playCardDeal = () => cardDealSound.play()
  const playChipMove = () => chipMoveSound.play()
  const playButtonClick = () => buttonClickSound.play()
  const playPlayerJoin = () => playerJoinSound.play()
  const playCardFlip = () => cardFlipSound.play()
  const startBackgroundMusic = () => backgroundMusic.play()
  const stopBackgroundMusic = () => backgroundMusic.stop()

  return (
    <AudioContext.Provider value={{
      isMuted,
      musicVolume,
      sfxVolume,
      toggleMute,
      setMusicVolume,
      setSfxVolume,
      playCardDeal,
      playChipMove,
      playButtonClick,
      playPlayerJoin,
      playCardFlip,
      startBackgroundMusic,
      stopBackgroundMusic
    }}>
      {children}
    </AudioContext.Provider>
  )
}