import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

const TRACKS = [
  { id: 1, title: "NIGHT_CHANGES.WAV", artist: "UNKNOWN", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "DATA_CORRUPTION.MP3", artist: "NULL_POINTER", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "VOID_SIGNAL.FLAC", artist: "GHOST_IN_MACHINE", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md bg-glitch-gray p-6 rounded-none border-4 border-glitch-magenta relative">
      <div className="absolute top-0 left-0 w-2 h-full bg-glitch-cyan opacity-50" />
      <div className="absolute bottom-0 right-0 w-full h-2 bg-glitch-magenta opacity-50" />
      
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={nextTrack}
      />
      
      <div className="mb-6 text-center border-b-2 border-glitch-cyan pb-4">
        <h3 className="text-2xl font-bold text-glitch-magenta truncate glitch-text" data-text={currentTrack.title}>{currentTrack.title}</h3>
        <p className="text-glitch-cyan text-sm tracking-widest mt-1">SRC: {currentTrack.artist}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 flex items-center gap-3 text-sm font-mono text-glitch-cyan">
        <span>[{formatTime(progress)}]</span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={progress}
          onChange={handleProgressChange}
          className="flex-1 h-2 bg-glitch-black rounded-none appearance-none cursor-pointer accent-glitch-magenta border border-glitch-cyan"
        />
        <span>[{formatTime(duration)}]</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <button 
          onClick={prevTrack}
          className="p-2 text-glitch-cyan hover:text-white hover:bg-glitch-cyan hover:text-black transition-all rounded-none border border-glitch-cyan"
        >
          <SkipBack size={24} />
        </button>
        
        <button 
          onClick={togglePlayPause}
          className={`p-4 bg-glitch-magenta text-black rounded-none border-2 border-white hover:bg-white hover:text-glitch-magenta transition-colors ${isPlaying ? 'screen-tear' : ''}`}
        >
          {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </button>
        
        <button 
          onClick={nextTrack}
          className="p-2 text-glitch-cyan hover:text-white hover:bg-glitch-cyan hover:text-black transition-all rounded-none border border-glitch-cyan"
        >
          <SkipForward size={24} />
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-3 border-t-2 border-glitch-magenta pt-4">
        <button onClick={toggleMute} className="text-glitch-magenta hover:text-white transition-colors">
          {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="flex-1 h-2 bg-glitch-black rounded-none appearance-none cursor-pointer accent-glitch-cyan border border-glitch-magenta"
        />
      </div>
      
      {/* Playlist */}
      <div className="mt-6 pt-4 border-t-2 border-glitch-cyan">
        <h4 className="text-sm uppercase tracking-widest text-glitch-cyan mb-3">AUDIO_STREAM_QUEUE</h4>
        <div className="space-y-2">
          {TRACKS.map((track, index) => (
            <button
              key={track.id}
              onClick={() => {
                setCurrentTrackIndex(index);
                setIsPlaying(true);
              }}
              className={`w-full text-left px-3 py-2 rounded-none flex items-center justify-between transition-colors border ${
                index === currentTrackIndex 
                  ? 'bg-glitch-magenta text-black border-white' 
                  : 'text-gray-400 border-transparent hover:border-glitch-cyan hover:text-glitch-cyan'
              }`}
            >
              <span className="truncate pr-4">SEQ_{index + 1}: {track.title}</span>
              {index === currentTrackIndex && isPlaying && (
                <div className="flex gap-1 h-3">
                  <div className="w-2 bg-black animate-[bounce_1s_infinite]" />
                  <div className="w-2 bg-black animate-[bounce_1s_infinite_0.2s]" />
                  <div className="w-2 bg-black animate-[bounce_1s_infinite_0.4s]" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
