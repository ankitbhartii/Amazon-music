'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Shuffle, 
  Volume2, 
  VolumeX, 
  Search, 
  LogOut, 
  Home, 
  Compass, 
  Music2, 
  ListMusic, 
  Heart,
  Settings,
  X,
  Mic,
  Maximize2,
  ChevronDown,
  Repeat
} from 'lucide-react';
import { authService, AuthUser } from '@/lib/supabaseClient';
import styles from './Dashboard.module.css';

interface DashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  color: string;
  label: string;
  imageUrl?: string;
  albumName?: string;
  audioUrl?: string;
  youtubeId?: string;
  genre?: string;
  releasedDate?: string;
  isNewRelease?: boolean;
}

const GENRES = ['All', 'Synthwave', 'Lofi', 'Acoustic', 'Funk', 'Pop', 'Bollywood'];

interface PodcastShow {
  id: string;
  title: string;
  publisher: string;
  description: string;
  color: string;
  label: string;
}

interface PodcastEpisode {
  id: string;
  showId: string;
  title: string;
  showTitle: string;
  description: string;
  duration: number; // in seconds
  audioUrl: string;
  color: string;
  label: string;
}

const MOCK_TRACKS: Track[] = [
  { id: '1', title: 'Alpha', artist: 'Rohansh & Abeer', duration: 184, color: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', label: 'ALP', genre: 'Acoustic', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&h=600&fit=crop' },
  { id: '2', title: 'Low Fade', artist: 'Karan Aujla', duration: 145, color: 'linear-gradient(135deg, #3E2723 0%, #5D4037 100%)', label: 'LFD', genre: 'Pop', isNewRelease: true, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&h=600&fit=crop' },
  { id: '3', title: 'Made in Indie', artist: 'Prateek Kuhad', duration: 210, color: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', label: 'MII', genre: 'Pop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=600&h=600&fit=crop' },
  { id: '4', title: 'Acoustic Indie', artist: 'Bon Iver', duration: 168, color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', label: 'ACI', genre: 'Acoustic', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&h=600&fit=crop' },
  { id: '5', title: 'Tamil Indie Hits', artist: 'Sai Abhyankkar', duration: 195, color: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)', label: 'TIH', genre: 'Bollywood', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&h=600&fit=crop' },
  { id: '6', title: 'Telugu Pop Studio', artist: 'Damini Bhatla', duration: 240, color: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', label: 'TPS', genre: 'Bollywood', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', imageUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392f?q=80&w=600&h=600&fit=crop' },
  { id: '7', title: 'Sakkath Flow', artist: 'Chandan Shetty', duration: 215, color: 'linear-gradient(135deg, #ec008c 0%, #fc6767 100%)', label: 'SKF', genre: 'Bollywood', isNewRelease: true, audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/89/66/d3/8966d3cb-68eb-5f2c-fef8-4ac420721387/mzaf_3044382270474258872.plus.aac.p.m4a', imageUrl: 'https://images.unsplash.com/photo-1486591978090-58e619d37fe7?q=80&w=600&h=600&fit=crop' },
  { id: '8', title: 'Amplifier', artist: 'Imran Khan', duration: 232, color: 'linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)', label: 'AMP', albumName: 'Unforgettable', genre: 'Bollywood', audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/7a/ff/ec/7affec81-4289-68f9-888d-78dc6552b39e/mzaf_5209920504603907510.plus.aac.p.m4a', imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=600&h=600&fit=crop' },
  { id: '9', title: 'Flowers', artist: 'Miley Cyrus', duration: 200, color: 'linear-gradient(135deg, #F3904F 0%, #3B4371 100%)', label: 'FLW', genre: 'Pop', isNewRelease: true, audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/03/8d/f3/038df3e8-63cf-2895-cd96-d4468f7eb486/mzaf_2689531189498263884.plus.aac.p.m4a', imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=600&h=600&fit=crop' },
  { id: '10', title: 'Starboy', artist: 'The Weeknd', duration: 230, color: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)', label: 'STB', genre: 'Pop', isNewRelease: true, audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/b6/c4/f3/b6c4f346-621e-d28a-7e15-c266472d4239/mzaf_632420993077708577.plus.aac.p.m4a', imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&h=600&fit=crop' },
  { id: '11', title: 'Stay', artist: 'The Kid LAROI & Justin Bieber', duration: 141, color: 'linear-gradient(135deg, #fd746c 0%, #ff9068 100%)', label: 'STY', genre: 'Pop', isNewRelease: true, audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/91/9f/5d/919f5db3-6623-7fa3-ad47-d1cb497bf68e/mzaf_13540203023023604084.plus.aac.p.m4a', imageUrl: 'https://images.unsplash.com/photo-1496568818309-53d7c7753022?q=80&w=600&h=600&fit=crop' },
  { id: '12', title: 'Chaleya', artist: 'Arijit Singh & Shilpa Rao', duration: 200, color: 'linear-gradient(135deg, #f77062 0%, #fe5196 100%)', label: 'CHL', genre: 'Bollywood', isNewRelease: true, audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/be/89/3b/be893bc6-52c6-3023-b1d5-bc4e24ebc692/mzaf_675306616422896502.plus.aac.p.m4a', imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&h=600&fit=crop' },
  { id: '13', title: 'Heeriye', artist: 'Jasleen Royal & Arijit Singh', duration: 194, color: 'linear-gradient(135deg, #243B55 0%, #141E30 100%)', label: 'HRY', genre: 'Bollywood', isNewRelease: true, audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/ca/84/c4/ca84c4e2-65a8-204b-9721-3965d1d64380/mzaf_4006198083818313881.plus.aac.p.m4a', imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=600&h=600&fit=crop' },
  
  // Custom Audio Tracks
  { id: '14', title: 'Midnight City Glow', artist: 'Neon Horizons', duration: 184, color: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', label: 'MCG', genre: 'Synthwave', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', imageUrl: 'https://images.unsplash.com/photo-1515462277126-270d878326e5?q=80&w=600&h=600&fit=crop' },
  { id: '15', title: 'Late Night Coffee', artist: 'Lofi Dreams', duration: 145, color: 'linear-gradient(135deg, #3E2723 0%, #5D4037 100%)', label: 'LNC', genre: 'Lofi', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&h=600&fit=crop' },
  { id: '16', title: 'Hyperdrive Engine', artist: 'Cyber Synth', duration: 210, color: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', label: 'HDE', genre: 'Synthwave', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&h=600&fit=crop' },
  { id: '17', title: 'Deep Focus Zen', artist: 'Study Wave', duration: 240, color: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', label: 'DFZ', genre: 'Lofi', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', imageUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392f?q=80&w=600&h=600&fit=crop' },
  { id: '18', title: 'Retro Funk Groove', artist: 'Funk Factory', duration: 195, color: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)', label: 'RFG', genre: 'Funk', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&h=600&fit=crop' },
  { id: '19', title: 'Shape of You', artist: 'Ed Sheeran', duration: 233, color: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', label: 'SOY', genre: 'Pop', audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/c7/4f/44c74f0d-72dc-6143-d4d0-ba14d661ca0d/mzaf_9566898362556366703.plus.aac.p.m4a', imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=600&h=600&fit=crop' },
  { id: '20', title: 'Kesariya', artist: 'Arijit Singh', duration: 268, color: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)', label: 'KES', albumName: 'Brahmastra', genre: 'Bollywood', audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/38/4c/5c/384c5c8f-3ff8-e457-b2f7-3158ce108649/mzaf_12389299033886433185.plus.aac.p.m4a', imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&h=600&fit=crop' },
  { id: '21', title: 'Tum Hi Ho', artist: 'Arijit Singh', duration: 261, color: 'linear-gradient(135deg, #12c2e9 0%, #c471ed 50%, #f64f59 100%)', label: 'THH', albumName: 'Aashiqui 2', genre: 'Bollywood', audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/38/de/b9/38deb942-d44a-f2bb-205c-ddf05be84693/mzaf_9747647124859107103.plus.aac.p.m4a', imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=600&h=600&fit=crop' },
  { id: '22', title: 'Bad Habits', artist: 'Ed Sheeran', duration: 231, color: 'linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)', label: 'BDH', genre: 'Pop', audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/c3/88/ca/c388ca65-5c12-32a2-3f1a-b31c969a68bc/mzaf_3800642398579998188.plus.aac.p.m4a', imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=600&h=600&fit=crop' },
  { id: '23', title: 'Levitating', artist: 'Dua Lipa', duration: 203, color: 'linear-gradient(135deg, #9796f0 0%, #fbc7d4 100%)', label: 'LEV', genre: 'Pop', audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/10/a5/d2/10a5d2f6-ebc2-be00-e758-c2b6279f0460/mzaf_13813936952702165038.plus.aac.p.m4a', imageUrl: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=600&h=600&fit=crop' },
  { id: '24', title: 'As It Was', artist: 'Harry Styles', duration: 167, color: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', label: 'AIW', genre: 'Pop', audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/bd/d0/55/bdd0550d-dfbe-2621-e737-f0a91176b9ee/mzaf_11306387063166367351.plus.aac.p.m4a', imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=600&h=600&fit=crop' },
  { id: '25', title: 'Cruel Summer', artist: 'Taylor Swift', duration: 178, color: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)', label: 'CRS', genre: 'Pop', audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/11/04/b9/1104b901-b54f-1eb7-8bf5-4a25dd4497cc/mzaf_3758362629707641774.plus.aac.p.m4a', imageUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=600&h=600&fit=crop' },
  { id: '26', title: 'Naatu Naatu', artist: 'Rahul Sipligunj & Kaala Bhairava', duration: 215, color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', label: 'NTN', genre: 'Bollywood', audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/b8/b5/1d/b8b51d6c-640a-5b12-a16a-8b89d4fb97a1/mzaf_8497886438883296231.plus.aac.p.m4a', imageUrl: 'https://images.unsplash.com/photo-1486591978090-58e619d37fe7?q=80&w=600&h=600&fit=crop' },
  { id: '27', title: 'Pasoori', artist: 'Ali Sethi & Shae Gill', duration: 224, color: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', label: 'PSR', genre: 'Bollywood', audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/71/39/72/71397262-d6ff-59fe-6c84-180a58145ee2/mzaf_10793610444390097781.plus.aac.p.m4a', imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600&h=600&fit=crop' },
  { id: '28', title: 'Despacito', artist: 'Luis Fonsi & Daddy Yankee', duration: 228, color: 'linear-gradient(135deg, #FF4E50 0%, #F9D423 100%)', label: 'DES', genre: 'Pop', audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/dc/24/76/dc2476d0-6f09-b68f-9a74-d477bb0b81df/mzaf_552763784196144893.plus.aac.p.m4a', imageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=600&h=600&fit=crop' }
];

const MOCK_ALBUMS = [
  { id: 'a1', title: 'Lo-Fi Cozy Chill', artist: 'Lofi Dreams', color: 'linear-gradient(135deg, #3E2723 0%, #5D4037 100%)', label: 'LCC', trackId: '15', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&h=600&fit=crop' },
  { id: 'a2', title: 'Synthwave Odyssey', artist: 'Cyber Synth', color: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', label: 'SWO', trackId: '16', imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&h=600&fit=crop' },
  { id: 'a3', title: 'Ocean Waves', artist: 'Ocean Acoustic', color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', label: 'OWA', trackId: '4', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&h=600&fit=crop' },
  { id: 'a4', title: 'Neon Night Drives', artist: 'Neon Horizons', color: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', label: 'NND', trackId: '14', imageUrl: 'https://images.unsplash.com/photo-1515462277126-270d878326e5?q=80&w=600&h=600&fit=crop' },
  { id: 'a5', title: 'Groove Factory', artist: 'Funk Factory', color: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)', label: 'GFA', trackId: '18', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&h=600&fit=crop' },
  { id: 'a6', title: 'Ambient Workspace', artist: 'Study Wave', color: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)', label: 'AWS', trackId: '17', imageUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392f?q=80&w=600&h=600&fit=crop' }
];

const MOCK_PODCASTS: PodcastShow[] = [
  { id: 'p1', title: 'Tech Talks Daily', publisher: 'Tech Hub', description: 'Your daily dose of tech news, gadgets, and insights.', color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', label: 'TTD' },
  { id: 'p2', title: 'Daily Calm & Focus', publisher: 'Mindfulness Network', description: 'Guided meditation and relaxing soundscapes for focus.', color: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', label: 'DCF' },
  { id: 'p3', title: 'Crime Chronicles', publisher: 'Mystery Labs', description: 'Chilling tales of true crime and unsolved mysteries.', color: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)', label: 'CC' },
  { id: 'p4', title: 'The Deep Dive Hub', publisher: 'Curious Mind', description: 'In-depth interviews with scientists, historians, and authors.', color: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', label: 'DDH' }
];

const MOCK_PODCAST_EPISODES: PodcastEpisode[] = [
  { id: 'pe1', showId: 'p1', title: 'The Future of Agentic AI', showTitle: 'Tech Talks Daily', description: 'In this episode, we talk about how agentic workflows are shaping modern software development.', duration: 320, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', label: 'AI' },
  { id: 'pe2', showId: 'p1', title: 'Web3 & Decentralization in 2026', showTitle: 'Tech Talks Daily', description: 'An overview of what decentralized applications look like in 2026 and why it matters.', duration: 280, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', label: 'W3' },
  { id: 'pe3', showId: 'p2', title: '10-Minute Morning Meditation', showTitle: 'Daily Calm & Focus', description: 'Start your morning with a clear head. A simple mindfulness exercise.', duration: 600, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', color: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', label: 'MED' },
  { id: 'pe4', showId: 'p3', title: 'The Midnight Heist of 1994', showTitle: 'Crime Chronicles', description: 'How a group of amateur thieves bypassed one of the most secure museum locks in Europe.', duration: 420, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', color: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)', label: 'CR' },
  { id: 'pe5', showId: 'p4', title: 'How Space Exploration Drives Innovation', showTitle: 'The Deep Dive Hub', description: 'Dr. Sarah Vance joins us to discuss space travel technology spin-offs in daily life.', duration: 510, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', color: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', label: 'SPC' }
];

const MOCK_LYRICS: Record<string, string> = {
  '1': "I hear the acoustic waves of Alpha...\nCalling out to the light...\nWe are standing under the stars...\nForever we are.",
  '2': "Yeah, Low Fade on the beat...\nRunning on the street...\nKeep it clean, keep it low...\nHere we go.",
  '3': "Dil kyun dharakta hai mera\nTumse kehne ko baatein hazaar\nMade in indie, made with love\nWe belong in the clouds above.",
  '4': "Skinny love, what happened here?\nSuckle on the forest floor\nStay indie, stay wild\nMy acoustic child.",
  '5': "Vaadi en karutha machan\nIndie music is our vibe\nTamil pride, worldwide\nDancing through the night.",
  '8': "Woofer tu meri, main tera amplifier\nFire! Main tera amplifier...\nGaadi meri behke behke\nTujhe dekh ke dil dhadke...\nMain tera amplifier!",
  '9': "We were good, we were gold\nKinda dream that can't be sold\nWe were right 'til we weren't\nBuilt a home and watched it burn\n\nI can buy myself flowers\nWrite my name in the sand\nTalk to myself for hours\nSay things you don't understand\nI can take myself dancing\nAnd I can hold my own hand\nYeah, I can love me better than you can.",
  '10': "I'm tryna put you in the worst mood, ah\nP1 cleaner than your church shoes, ah\nLook what you've done\nI'm a motherfucking starboy.",
  '11': "I do the same thing I told you that I never would\nI told you I'd change, even when I knew I never could\nI know that I can't find nobody else as good as you\nI need you to stay, need you to stay, yeah.",
  '12': "Mera dil chala hai chaleya\Teri ore chaleya chaleya\nIshq mein dil fana hai...",
  '13': "Heeriye heeriye aa...\nInna saara pyaar deya...\nJaan vi tu lele meri...",
  '20': "Kesariya tera ishq hai piya\nRang jaaun jo main haath lagaaun\nDin beete saara teri fikr mein\nRain saari teri khair manaaun."
};

function getShuffleIndex(currentListLength: number, currentIndex: number): number {
  if (currentListLength <= 1) return 0;
  let randIndex = Math.floor(Math.random() * currentListLength);
  while (randIndex === currentIndex) {
    randIndex = Math.floor(Math.random() * currentListLength);
  }
  return randIndex;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>(MOCK_TRACKS[0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [prevVolume, setPrevVolume] = useState(0.8);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'find' | 'library' | 'podcasts' | 'lyrics'>('home');
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  
  // Expanded Player States
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [showSyncedLyrics, setShowSyncedLyrics] = useState(false);
  
  // Recommendation System States
  const [listenHistory, setListenHistory] = useState<string[]>([]);

  // API Integration States
  const [showSettings, setShowSettings] = useState(false);
  const [apiToken, setApiToken] = useState('');
  const [apiUrl, setApiUrl] = useState('https://amz.dezalty.com');
  const [isApiActive, setIsApiActive] = useState(false);
  const [searchProvider, setSearchProvider] = useState<'amazon' | 'free'>('free');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [trackLyrics, setTrackLyrics] = useState<string | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  interface YTPlayerInstance {
    setVolume: (vol: number) => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    playVideo: () => void;
    pauseVideo: () => void;
    loadVideoById: (args: { videoId: string; startSeconds: number }) => void;
  }

  const audioRef = useRef<HTMLAudioElement>(null);
  const volumeSliderRef = useRef<HTMLDivElement>(null);
  const isTransitioningRef = useRef(false);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const loadingTrackIdRef = useRef<string | null>(null);
  const loadedUrlRef = useRef<string | null>(null);

  const toggleLikeTrack = useCallback((trackId: string) => {
    setLikedTrackIds((prev) => {
      const updated = prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('amz_liked_tracks', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const addToListenHistory = useCallback((trackId: string) => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('amz_listen_history');
      let history: string[] = stored ? JSON.parse(stored) : [];
      history = history.filter((id) => id !== trackId);
      history.unshift(trackId);
      if (history.length > 10) {
        history = history.slice(0, 10);
      }
      localStorage.setItem('amz_listen_history', JSON.stringify(history));
      setListenHistory(history);
    } catch (e) {
      console.error('Error updating listen history:', e);
    }
  }, []);

  // Derived States using useMemo
  const recentlyPlayed = useMemo(() => {
    return listenHistory
      .map((id) => MOCK_TRACKS.find((t) => t.id === id))
      .filter((t): t is Track => !!t);
  }, [listenHistory]);

  const newReleases = useMemo(() => {
    return MOCK_TRACKS.filter((t) => t.isNewRelease);
  }, []);

  const recommendedTracks = useMemo(() => {
    const likedTracks = MOCK_TRACKS.filter((t) => likedTrackIds.includes(t.id));
    const playedTracks = listenHistory
      .map((id) => MOCK_TRACKS.find((t) => t.id === id))
      .filter((t): t is Track => !!t);

    const userTracks = [...likedTracks, ...playedTracks];
    const favoriteGenres = userTracks
      .map((t) => t.genre)
      .filter((g): g is string => !!g);

    const genreCounts: Record<string, number> = {};
    favoriteGenres.forEach((g) => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });

    let favoriteGenre = 'Pop';
    let maxCount = 0;
    Object.entries(genreCounts).forEach(([genre, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteGenre = genre;
      }
    });

    let recommendations = MOCK_TRACKS.filter(
      (t) => t.genre === favoriteGenre && !likedTrackIds.includes(t.id) && !listenHistory.includes(t.id)
    );

    if (recommendations.length < 6) {
      const remaining = MOCK_TRACKS.filter(
        (t) => !likedTrackIds.includes(t.id) && !listenHistory.includes(t.id) && t.genre !== favoriteGenre
      );
      recommendations = [...recommendations, ...remaining];
    }

    return recommendations.slice(0, 8);
  }, [listenHistory, likedTrackIds]);

  const loadTrack = useCallback(async (track: Track) => {
    loadingTrackIdRef.current = track.id;
    isTransitioningRef.current = true;
    addToListenHistory(track.id);
    
    // Clear and reset HTML5 audio immediately
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.currentTime = 0;
    }
    loadedUrlRef.current = '';
    
    const yt = ytPlayerRef.current;
    if (yt && typeof yt.pauseVideo === 'function') {
      yt.pauseVideo();
    }

    setCurrentTime(0);
    setTrackLyrics(MOCK_LYRICS[track.id] || "Lyrics for this track are loading...\nConnect your Amazon API to fetch live synced lyrics!");
    setShowLyrics(false);

    if (searchProvider === 'free') {
      // Resolve YouTube Video ID for full-length playback
      try {
        const queryTerm = `${track.artist} ${track.title}`;
        const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(queryTerm)}`);
        const data = await res.json();
        
        if (loadingTrackIdRef.current !== track.id) return;
        
        if (data.videoId) {
          const updatedTrack = {
            ...track,
            youtubeId: data.videoId
          };
          
          if (yt && typeof yt.loadVideoById === 'function') {
            yt.loadVideoById({
              videoId: data.videoId,
              startSeconds: 0
            });
            yt.playVideo();
            yt.setVolume(Math.floor(volume * 100));
            
            // Set current track and play state only after YouTube has resolved it!
            isTransitioningRef.current = false;
            setCurrentTrack(updatedTrack);
            setIsPlaying(true);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to resolve YouTube stream:', err);
      }
    }

    if (loadingTrackIdRef.current !== track.id) return;

    isTransitioningRef.current = false;
    setCurrentTrack(track);
    setIsPlaying(true);

    // Fetch full metadata and lyrics if API is active
    if (searchProvider === 'amazon' && isApiActive && apiToken) {
      // 1. Fetch metadata
      try {
        const metadataResponse = await fetch(
          `/api/amazon?endpoint=track&id=${track.id}&token=${apiToken}&api_url=${encodeURIComponent(apiUrl)}`
        );
        const metadataData = await metadataResponse.json();
        
        if (loadingTrackIdRef.current !== track.id) return;
        
        if (metadataData && !metadataData.error) {
          const trackInfo = metadataData.data || metadataData;
          setCurrentTrack({
            id: trackInfo.id || trackInfo.asin || track.id,
            title: trackInfo.title || track.title,
            artist: trackInfo.artist?.name || trackInfo.artist || track.artist,
            duration: trackInfo.duration ? Math.floor(trackInfo.duration) : track.duration,
            color: track.color,
            label: trackInfo.title ? trackInfo.title.substring(0, 3).toUpperCase() : track.label,
            imageUrl: trackInfo.image || trackInfo.album?.image || track.imageUrl,
            albumName: trackInfo.album?.title || trackInfo.album || track.albumName
          });
        }
      } catch (err) {
        console.error('Failed to fetch track metadata:', err);
      }

      // 2. Fetch lyrics
      try {
        const response = await fetch(
          `/api/amazon?endpoint=lyrics&id=${track.id}&token=${apiToken}&api_url=${encodeURIComponent(apiUrl)}`
        );
        const data = await response.json();
        
        if (loadingTrackIdRef.current !== track.id) return;
        
        if (data.success && data.data) {
          setTrackLyrics(data.data.lyrics || data.data);
        } else if (data.lyrics) {
          setTrackLyrics(data.lyrics);
        }
      } catch (err) {
        console.error('Failed to fetch lyrics:', err);
      }
    }
  }, [searchProvider, volume, isApiActive, apiToken, apiUrl, addToListenHistory]);

  const playEpisode = useCallback((episode: PodcastEpisode) => {
    const trackCompat: Track = {
      id: episode.id,
      title: episode.title,
      artist: episode.showTitle,
      duration: episode.duration,
      color: episode.color,
      label: episode.label,
      audioUrl: episode.audioUrl,
      albumName: 'Podcast Episode'
    };
    loadTrack(trackCompat);
  }, [loadTrack]);

  const handleNextTrack = useCallback(() => {
    let nextIndex = 0;
    const currentList = searchResults.length > 0 ? searchResults : MOCK_TRACKS;
    if (isShuffle && currentList.length > 1) {
      const currentIndex = currentList.findIndex((t) => t.id === currentTrack.id);
      nextIndex = getShuffleIndex(currentList.length, currentIndex);
    } else {
      const currentIndex = currentList.findIndex((t) => t.id === currentTrack.id);
      nextIndex = (currentIndex === -1 ? 0 : currentIndex + 1) % currentList.length;
    }
    loadTrack(currentList[nextIndex]);
  }, [loadTrack, isShuffle, currentTrack.id, searchResults]);

  const handlePrevTrack = useCallback(() => {
    const isYtTrack = searchProvider === 'free' && currentTrack.youtubeId;
    const yt = ytPlayerRef.current;

    if (currentTime > 4) {
      if (isYtTrack && yt && typeof yt.seekTo === 'function') {
        yt.seekTo(0, true);
      } else if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      setCurrentTime(0);
    } else {
      const currentList = searchResults.length > 0 ? searchResults : MOCK_TRACKS;
      if (isShuffle && currentList.length > 1) {
        const currentIndex = currentList.findIndex((t) => t.id === currentTrack.id);
        const randIndex = getShuffleIndex(currentList.length, currentIndex);
        loadTrack(currentList[randIndex]);
      } else {
        const currentIndex = currentList.findIndex((t) => t.id === currentTrack.id);
        let prevIndex = currentIndex === -1 ? 0 : currentIndex - 1;
        if (prevIndex < 0) prevIndex = currentList.length - 1;
        loadTrack(currentList[prevIndex]);
      }
    }
  }, [loadTrack, isShuffle, currentTrack.id, currentTrack.youtubeId, searchResults, currentTime, searchProvider]);

  const handleTrackFinished = useCallback(() => {
    if (isRepeat) {
      const isYtTrack = searchProvider === 'free' && currentTrack.youtubeId;
      const yt = ytPlayerRef.current;

      if (isYtTrack && yt && typeof yt.seekTo === 'function') {
        yt.seekTo(0, true);
        yt.playVideo();
      } else if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => console.warn('Audio loop failed:', err));
      }
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      handleNextTrack();
    }
  }, [isRepeat, searchProvider, currentTrack.youtubeId, handleNextTrack]);

  const handlePlayPause = useCallback(() => {
    const isCurrentlyPlaying = !isPlaying;
    setIsPlaying(isCurrentlyPlaying);
    
    const yt = ytPlayerRef.current;
    const isYtTrack = searchProvider === 'free' && currentTrack.youtubeId;

    if (isYtTrack && yt && typeof (yt.playVideo) === 'function') {
      if (isCurrentlyPlaying) {
        yt.playVideo();
      } else {
        yt.pauseVideo();
      }
    }
  }, [isPlaying, searchProvider, currentTrack.youtubeId]);

  // Stable audio progress tracker - uses refs to avoid stale closures and re-render loops
  const currentTrackRef = useRef(currentTrack);
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);

  const handleTrackFinishedRef = useRef(handleTrackFinished);
  useEffect(() => { handleTrackFinishedRef.current = handleTrackFinished; }, [handleTrackFinished]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      // Always read directly from audio element — no stale closure issues
      const t = Math.floor(audio.currentTime);
      setCurrentTime(t);

      // Sync track duration from actual media if it differs significantly
      if (audio.duration && isFinite(audio.duration) && !isNaN(audio.duration)) {
        const d = Math.floor(audio.duration);
        const cur = currentTrackRef.current;
        if (!cur.duration || cur.duration === 0 || Math.abs(cur.duration - d) > 5) {
          setCurrentTrack((prev) => ({ ...prev, duration: d }));
        }
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration) && !isNaN(audio.duration)) {
        const d = Math.floor(audio.duration);
        const cur = currentTrackRef.current;
        if (!cur.duration || cur.duration === 0 || Math.abs(cur.duration - d) > 5) {
          setCurrentTrack((prev) => ({ ...prev, duration: d }));
        }
      }
    };

    const onEnded = () => handleTrackFinishedRef.current();
    const onPlay  = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate',     onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended',          onEnded);
    audio.addEventListener('play',           onPlay);
    audio.addEventListener('pause',          onPause);

    return () => {
      audio.removeEventListener('timeupdate',     onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended',          onEnded);
      audio.removeEventListener('play',           onPlay);
      audio.removeEventListener('pause',          onPause);
    };
  // Intentionally empty: attach once on mount, read everything via refs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleSaveSettings = useCallback((token: string, url: string) => {
    if (typeof window !== 'undefined') {
      const cleanToken = token.trim();
      const cleanUrl = url.trim() || 'https://amz.dezalty.com';
      
      if (cleanToken) {
        localStorage.setItem('amz_access_token', cleanToken);
        setIsApiActive(true);
      } else {
        localStorage.removeItem('amz_access_token');
        setIsApiActive(false);
      }
      localStorage.setItem('amz_api_url', cleanUrl);
      setApiToken(cleanToken);
      setApiUrl(cleanUrl);
      setShowSettings(false);
      setApiError(null);
      
      setSearchResults([]);
      setTrackLyrics(null);
    }
  }, []);

  const handleClearSettings = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('amz_access_token');
      localStorage.removeItem('amz_api_url');
      setApiToken('');
      setApiUrl('https://amz.dezalty.com');
      setIsApiActive(false);
      setSearchResults([]);
      setTrackLyrics(null);
      setShowSettings(false);
      setApiError(null);
    }
  }, []);

  const handleLogoutClick = async () => {
    try {
      await authService.signOut();
    } catch {
      // Ignored for UI
    } finally {
      onLogout();
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === null || seconds === undefined) {
      return '0:00';
    }
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Seek on click on the progress bar wrapper
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    
    const isYtTrack = searchProvider === 'free' && currentTrack.youtubeId;
    const yt = ytPlayerRef.current;

    if (isYtTrack && yt && typeof yt.seekTo === 'function') {
      const durationToUse = currentTrack.duration || (typeof yt.getDuration === 'function' ? yt.getDuration() : 180);
      const newTime = Math.floor(percentage * durationToUse);
      yt.seekTo(newTime, true);
      setCurrentTime(newTime);
    } else if (audioRef.current) {
      const audio = audioRef.current;
      const durationToUse = audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0
        ? audio.duration
        : (currentTrack.duration || 180);
      
      const seekSeconds = Math.max(0, Math.min(durationToUse - 0.1, percentage * durationToUse));
      audio.currentTime = seekSeconds;
      
      const stateDuration = currentTrack.duration || durationToUse;
      const displayTime = Math.floor(percentage * stateDuration);
      setCurrentTime(displayTime);
    }
  };

  // Change volume on click
  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeSliderRef.current) return;
    const rect = volumeSliderRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, clickX / rect.width));
    setVolume(newVolume);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume || 0.8);
    }
  };

  // Load API config and load YouTube Player API on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const storedToken = localStorage.getItem('amz_access_token');
        const storedUrl = localStorage.getItem('amz_api_url') || 'https://amz.dezalty.com';
        const storedProvider = localStorage.getItem('amz_search_provider') || 'free';
        const storedLikes = localStorage.getItem('amz_liked_tracks');
        const storedHistory = localStorage.getItem('amz_listen_history');
        if (storedToken) {
          setApiToken(storedToken);
          setIsApiActive(true);
        }
        setApiUrl(storedUrl);
        setSearchProvider(storedProvider as 'amazon' | 'free');

        if (storedLikes) {
          try {
            setLikedTrackIds(JSON.parse(storedLikes));
          } catch (e) {
            console.error('Error parsing liked tracks:', e);
          }
        }

        if (storedHistory) {
          try {
            setListenHistory(JSON.parse(storedHistory));
          } catch (e) {
            console.error('Error parsing listen history:', e);
          }
        }
      }, 0);

      // Load YouTube Player API
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      if (!win.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        
        win.onYouTubeIframeAPIReady = () => {
          initializeYtPlayer();
        };
      } else {
        initializeYtPlayer();
      }

      function initializeYtPlayer() {
        win.ytPlayer = new win.YT.Player('yt-player-container', {
          height: '200',
          width: '200',
          videoId: '',
          playerVars: {
            playsinline: 1,
            disablekb: 1,
            controls: 0,
            rel: 0
          },
          events: {
            onReady: () => {
              ytPlayerRef.current = win.ytPlayer;
            },
            onStateChange: (event: { data: number }) => {
              // 0 means ENDED
              if (event.data === 0) {
                handleTrackFinished();
              } else if (event.data === 1) {
                setIsPlaying(true);
              } else if (event.data === 2) {
                setIsPlaying(false);
              }
            }
          }
        });
      }
    }
  }, [handleTrackFinished]);

  // HTML5 Audio playback controller
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const isYtTrack = searchProvider === 'free' && currentTrack.youtubeId;
    if (isYtTrack) {
      audio.pause();
      isTransitioningRef.current = false;
      return;
    }

    // Use track URL or default fallback
    const activeUrl = currentTrack.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    
    if (loadedUrlRef.current !== activeUrl) {
      loadedUrlRef.current = activeUrl;
      audio.src = activeUrl;
      audio.load();
      audio.currentTime = 0;
    }

    if (isPlaying) {
      audio.play()
        .then(() => {
          isTransitioningRef.current = false;
        })
        .catch((err) => {
          console.warn('Playback request failed or interrupted:', err);
          isTransitioningRef.current = false;
        });
    } else {
      audio.pause();
      isTransitioningRef.current = false;
    }
  }, [isPlaying, currentTrack.audioUrl, currentTrack.youtubeId, searchProvider]);

  // Pause audio and cleanup on unmount
  useEffect(() => {
    const audioNode = audioRef.current;
    return () => {
      if (audioNode) {
        audioNode.pause();
        audioNode.src = '';
      }
      const yt = ytPlayerRef.current;
      if (yt && typeof yt.pauseVideo === 'function') {
        yt.pauseVideo();
      }
    };
  }, []);

  // Sync volume level
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    const yt = ytPlayerRef.current;
    if (yt && typeof yt.setVolume === 'function') {
      yt.setVolume(Math.floor(volume * 100));
    }
  }, [volume]);

  // Sync YouTube playback progress timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const isYtTrack = searchProvider === 'free' && currentTrack.youtubeId;

    if (isPlaying && isYtTrack) {
      interval = setInterval(() => {
        const yt = ytPlayerRef.current;
        if (yt && typeof yt.getCurrentTime === 'function') {
          try {
            const ytTime = Math.floor(yt.getCurrentTime());
            if (!isNaN(ytTime)) {
              setCurrentTime(ytTime);
            }
            
            // Sync duration if missing or 0
            if (typeof yt.getDuration === 'function') {
              const ytDuration = Math.floor(yt.getDuration());
              if (ytDuration > 0 && (!currentTrack.duration || currentTrack.duration === 0)) {
                setCurrentTrack((prev) => ({
                  ...prev,
                  duration: ytDuration
                }));
              }
            }
          } catch {
            // ignore
          }
        }
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTrack.youtubeId, searchProvider, currentTrack]);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setApiLoading(true);
      setApiError(null);
      try {
        if (searchProvider === 'amazon' && isApiActive && apiToken) {
          const response = await fetch(
            `/api/amazon?endpoint=search&query=${encodeURIComponent(searchQuery)}&token=${apiToken}&api_url=${encodeURIComponent(apiUrl)}`
          );
          const data = await response.json();
          
          if (data.error) {
            setApiError(data.error);
            setSearchResults([]);
          } else if (data.data && Array.isArray(data.data)) {
            interface AmazonApiTrack {
              id?: string;
              asin?: string;
              title?: string;
              artist?: string | { name?: string };
              duration?: number;
              image?: string;
              album?: string | { title?: string; image?: string };
            }
            const tracks: Track[] = (data.data as AmazonApiTrack[]).map((item) => ({
              id: item.id || item.asin || Math.random().toString(),
              title: item.title || 'Unknown Track',
              artist: typeof item.artist === 'string' ? item.artist : (item.artist?.name || 'Unknown Artist'),
              duration: item.duration ? Math.floor(item.duration) : 180,
              color: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              label: 'AMZ',
              imageUrl: typeof item.album === 'string' ? undefined : (item.image || item.album?.image || undefined),
              albumName: typeof item.album === 'string' ? item.album : (item.album?.title || undefined)
            }));
            setSearchResults(tracks);
          } else {
            setSearchResults([]);
          }
        } else {
          // Free iTunes Search API
          const response = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&media=music&limit=20`
          );
          const data = await response.json();
          if (data && data.results) {
            interface ITunesApiTrack {
              trackId?: number;
              collectionId?: number;
              trackName?: string;
              artistName?: string;
              trackTimeMillis?: number;
              artworkUrl100?: string;
              artworkUrl60?: string;
              collectionName?: string;
              previewUrl?: string;
            }
            const tracks: Track[] = (data.results as ITunesApiTrack[]).map((item) => ({
              id: String(item.trackId || item.collectionId),
              title: item.trackName || 'Unknown Track',
              artist: item.artistName || 'Unknown Artist',
              duration: item.trackTimeMillis ? Math.floor(item.trackTimeMillis / 1000) : 180,
              color: 'linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)',
              label: 'FREE',
              imageUrl: item.artworkUrl100 || item.artworkUrl60,
              albumName: item.collectionName,
              audioUrl: item.previewUrl
            }));
            setSearchResults(tracks);
          } else {
            setSearchResults([]);
          }
        }
      } catch (err) {
        console.error(err);
        setApiError('Failed to complete search query.');
      } finally {
        setApiLoading(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, searchProvider, isApiActive, apiToken, apiUrl]);

  // Filter content
  const filteredTracks = MOCK_TRACKS.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showApiResults = searchProvider === 'free' || (searchProvider === 'amazon' && isApiActive);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className={styles.dashboardLayout}>
      <div className="glow-wrapper"></div>
      
      {/* TOP HEADER NAVIGATION BAR */}
      <header className={styles.topHeader}>
        {/* Left: Logo */}
        <div className={styles.logoSection} onClick={() => { setActiveTab('home'); setSearchQuery(''); }}>
          <div className={styles.logoText}>
            amazon <span className={styles.logoMusic}>music</span>
          </div>
        </div>

        {/* Center: Navigation links */}
        <nav className={styles.navGroup}>
          <button 
            type="button"
            className={`${styles.navLink} ${activeTab === 'home' && searchQuery === '' ? styles.navLinkActive : ''}`}
            onClick={() => { setActiveTab('home'); setSearchQuery(''); }}
          >
            <Home size={18} />
            <span className={styles.navLabel}>Home</span>
          </button>
          <button 
            type="button"
            className={`${styles.navLink} ${activeTab === 'find' || searchQuery !== '' ? styles.navLinkActive : ''}`}
            onClick={() => setActiveTab('find')}
          >
            <Compass size={18} />
            <span className={styles.navLabel}>Music</span>
          </button>
          <button 
            type="button"
            className={`${styles.navLink} ${activeTab === 'podcasts' ? styles.navLinkActive : ''}`}
            onClick={() => setActiveTab('podcasts')}
          >
            <ListMusic size={18} />
            <span className={styles.navLabel}>Podcasts</span>
          </button>
          <button 
            type="button"
            className={`${styles.navLink} ${activeTab === 'library' ? styles.navLinkActive : ''}`}
            onClick={() => setActiveTab('library')}
          >
            <Heart size={18} />
            <span className={styles.navLabel}>Library</span>
          </button>
          <button 
            type="button"
            className={`${styles.navLink} ${activeTab === 'lyrics' ? styles.navLinkActive : ''}`}
            onClick={() => setActiveTab('lyrics')}
          >
            <Mic size={18} />
            <span className={styles.navLabel}>Lyrics</span>
          </button>
        </nav>

        {/* Right: Search, Settings, Profile */}
        <div className={styles.headerRight}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (!val.trim()) {
                  setSearchResults([]);
                  setApiError(null);
                }
              }}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.userProfileMenu}>
            {isApiActive && (
              <div className={styles.settingsIndicator} title="Connected to Amazon Music API">
                <Music2 size={12} />
                <span>API</span>
              </div>
            )}
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={() => setShowSettings(true)}
              title="API Settings"
              style={{ color: isApiActive ? 'var(--accent-cyan)' : 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Settings size={16} />
            </button>
            <div className={styles.userBadge}>
              <div className={styles.avatar}>
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={handleLogoutClick}
              title="Sign Out"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN GALLERY VIEW */}
      <main className={styles.mainContent}>

        {searchQuery === '' ? (
          <>
            {/* HOME TAB VIEW */}
            {activeTab === 'home' && (
              <>
                {/* Hero promo banner */}
                <section className={`${styles.heroBanner} animate-slide-in`}>
                  <span className={styles.heroTagline}>STATION</span>
                  <h2 className={styles.heroTitle}>My Soundtrack</h2>
                  <p className={styles.heroSubtitle}>
                    Based on Yo Yo Honey Singh, Badshah and more...
                  </p>
                  <div className={styles.heroActions}>
                    <button
                      type="button"
                      className={styles.playBtn}
                      onClick={() => loadTrack(MOCK_TRACKS[0])}
                    >
                      <Play size={16} fill="currentColor" /> Play
                    </button>
                  </div>
                </section>

                {/* Listen Again (Recently Played) */}
                {recentlyPlayed.length > 0 && (
                  <section className={styles.gallerySection}>
                    <div className={styles.sectionTitleRow}>
                      <h3 className={styles.sectionTitle}>Listen Again</h3>
                    </div>
                    <div className={styles.horizontalScrollRow}>
                      {recentlyPlayed.map((track) => (
                        <div
                          key={`recent-${track.id}`}
                          className={styles.albumCard}
                          onClick={() => loadTrack(track)}
                          style={{ minWidth: '160px', maxWidth: '160px' }}
                        >
                          <div className={styles.artWrapper} style={{ height: '160px' }}>
                            {track.imageUrl ? (
                              <img src={track.imageUrl} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div className={styles.albumArtCustom} style={{ background: track.color }}>
                                <Music2 size={24} className={styles.artIcon} />
                                <span className={styles.artLabel}>{track.label}</span>
                              </div>
                            )}
                            <div className={styles.cardPlayOverlay}>
                              <div className={styles.overlayPlayIcon}>
                                <Play size={20} fill="currentColor" />
                              </div>
                            </div>
                          </div>
                          <div className={styles.albumMeta}>
                            <span className={styles.albumName}>{track.title}</span>
                            <span className={styles.albumArtist}>{track.artist}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Recommended Albums */}
                <section className={styles.gallerySection}>
                  <div className={styles.sectionTitleRow}>
                    <h3 className={styles.sectionTitle}>Recommended Albums</h3>
                    <a href="#" className={styles.seeAllLink}>See All</a>
                  </div>
                  <div className={styles.horizontalScrollRow}>
                    {MOCK_ALBUMS.map((album) => (
                      <div
                        key={album.id}
                        className={styles.albumCard}
                        onClick={() => {
                          const track = MOCK_TRACKS.find((t) => t.id === album.trackId);
                          if (track) loadTrack(track);
                        }}
                        style={{ minWidth: '160px', maxWidth: '160px' }}
                      >
                        <div className={styles.artWrapper} style={{ height: '160px' }}>
                          {album.imageUrl ? (
                            <img src={album.imageUrl} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div className={styles.albumArtCustom} style={{ background: album.color }}>
                              <Music2 size={24} className={styles.artIcon} />
                              <span className={styles.artLabel}>{album.label}</span>
                            </div>
                          )}
                          <div className={styles.cardPlayOverlay}>
                            <div className={styles.overlayPlayIcon}>
                              <Play size={20} fill="currentColor" />
                            </div>
                          </div>
                        </div>
                        <div className={styles.albumMeta}>
                          <span className={styles.albumName}>{album.title}</span>
                          <span className={styles.albumArtist}>{album.artist}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Recommended for You */}
                <section className={styles.gallerySection}>
                  <div className={styles.sectionTitleRow}>
                    <h3 className={styles.sectionTitle}>Recommended for You</h3>
                  </div>
                  <div className={styles.horizontalScrollRow}>
                    {recommendedTracks.map((track) => (
                      <div
                        key={`rec-${track.id}`}
                        className={styles.albumCard}
                        onClick={() => loadTrack(track)}
                        style={{ minWidth: '160px', maxWidth: '160px' }}
                      >
                        <div className={styles.artWrapper} style={{ height: '160px' }}>
                          {track.imageUrl ? (
                            <img src={track.imageUrl} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div className={styles.albumArtCustom} style={{ background: track.color }}>
                              <Music2 size={24} className={styles.artIcon} />
                              <span className={styles.artLabel}>{track.label}</span>
                            </div>
                          )}
                          <div className={styles.cardPlayOverlay}>
                            <div className={styles.overlayPlayIcon}>
                              <Play size={20} fill="currentColor" />
                            </div>
                          </div>
                        </div>
                        <div className={styles.albumMeta}>
                          <span className={styles.albumName}>{track.title}</span>
                          <span className={styles.albumArtist}>{track.artist}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* New Releases */}
                <section className={styles.gallerySection}>
                  <div className={styles.sectionTitleRow}>
                    <h3 className={styles.sectionTitle}>New Releases</h3>
                  </div>
                  <div className={styles.horizontalScrollRow}>
                    {newReleases.map((track) => (
                      <div
                        key={`new-${track.id}`}
                        className={styles.albumCard}
                        onClick={() => loadTrack(track)}
                        style={{ minWidth: '160px', maxWidth: '160px' }}
                      >
                        <div className={styles.artWrapper} style={{ height: '160px' }}>
                          {track.imageUrl ? (
                            <img src={track.imageUrl} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div className={styles.albumArtCustom} style={{ background: track.color }}>
                              <Music2 size={24} className={styles.artIcon} />
                              <span className={styles.artLabel}>{track.label}</span>
                            </div>
                          )}
                          <div className={styles.cardPlayOverlay}>
                            <div className={styles.overlayPlayIcon}>
                              <Play size={20} fill="currentColor" />
                            </div>
                          </div>
                        </div>
                        <div className={styles.albumMeta}>
                          <span className={styles.albumName}>{track.title}</span>
                          <span className={styles.albumArtist}>{track.artist}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Catalog List */}
                <section className={styles.gallerySection}>
                  <div className={styles.sectionTitleRow}>
                    <h3 className={styles.sectionTitle}>Featured Tracks</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {MOCK_TRACKS.slice(0, 8).map((track) => (
                      <div
                        key={track.id}
                        onClick={() => loadTrack(track)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '10px 16px',
                          background: currentTrack.id === track.id ? 'rgba(0, 210, 243, 0.08)' : 'rgba(255,255,255,0.02)',
                          border: currentTrack.id === track.id ? '1px solid rgba(0, 210, 243, 0.3)' : '1px solid transparent',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          justifyContent: 'space-between',
                          transition: 'background 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                          {track.imageUrl ? (
                            <img src={track.imageUrl} alt={track.title} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '6px',
                                background: track.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.65rem',
                                flexShrink: 0
                              }}
                            >
                              {track.label}
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: currentTrack.id === track.id ? 'var(--accent-cyan)' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {track.title}
                            </p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{track.artist}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLikeTrack(track.id);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: likedTrackIds.includes(track.id) ? 'var(--accent-cyan)' : 'var(--text-secondary)', padding: '4px' }}
                            title={likedTrackIds.includes(track.id) ? "Remove from Library" : "Save to Library"}
                          >
                            <Heart size={15} fill={likedTrackIds.includes(track.id) ? "currentColor" : "none"} />
                          </button>
                          <span>{formatTime(track.duration)}</span>
                          {currentTrack.id === track.id && isPlaying ? (
                            <Pause size={16} style={{ color: 'var(--accent-cyan)' }} />
                          ) : (
                            <Play size={16} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* MUSIC / FIND TAB VIEW */}
            {activeTab === 'find' && (
              <>
                <section className={styles.gallerySection}>
                  <div className={styles.sectionTitleRow}>
                    <h3 className={styles.sectionTitle}>Explore by Genre</h3>
                  </div>
                  <div className={styles.genrePillRow}>
                    {GENRES.map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        className={`${styles.genrePill} ${selectedGenre === genre ? styles.genrePillActive : ''}`}
                        onClick={() => setSelectedGenre(genre)}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </section>

                <section className={styles.gallerySection}>
                  <div className={styles.sectionTitleRow}>
                    <h3 className={styles.sectionTitle}>
                      {selectedGenre === 'All' ? 'Featured Tracks' : `${selectedGenre} Tracks`}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {MOCK_TRACKS.filter((t) => selectedGenre === 'All' || t.genre === selectedGenre).map((track) => (
                      <div
                        key={track.id}
                        onClick={() => loadTrack(track)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '10px 16px',
                          background: currentTrack.id === track.id ? 'rgba(0, 210, 243, 0.08)' : 'rgba(255,255,255,0.02)',
                          border: currentTrack.id === track.id ? '1px solid rgba(0, 210, 243, 0.3)' : '1px solid transparent',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          justifyContent: 'space-between',
                          transition: 'background 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '6px',
                              background: track.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.65rem',
                              flexShrink: 0
                            }}
                          >
                            {track.label}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: currentTrack.id === track.id ? 'var(--accent-cyan)' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {track.title}
                            </p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{track.artist}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLikeTrack(track.id);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: likedTrackIds.includes(track.id) ? 'var(--accent-cyan)' : 'var(--text-secondary)', padding: '4px' }}
                            title={likedTrackIds.includes(track.id) ? "Remove from Library" : "Save to Library"}
                          >
                            <Heart size={15} fill={likedTrackIds.includes(track.id) ? "currentColor" : "none"} />
                          </button>
                          <span>{formatTime(track.duration)}</span>
                          {currentTrack.id === track.id && isPlaying ? (
                            <Pause size={16} style={{ color: 'var(--accent-cyan)' }} />
                          ) : (
                            <Play size={16} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* PODCASTS TAB VIEW */}
            {activeTab === 'podcasts' && (
              <>
                <section className={styles.gallerySection}>
                  <div className={styles.sectionTitleRow}>
                    <h3 className={styles.sectionTitle}>Featured Shows</h3>
                  </div>
                  <div className={styles.podcastGrid}>
                    {MOCK_PODCASTS.map((show) => (
                      <div key={show.id} className={styles.podcastCard}>
                        <div className={styles.podcastArt} style={{ background: show.color }}>
                          <span className={styles.podcastLabel}>{show.label}</span>
                        </div>
                        <div className={styles.podcastMeta}>
                          <span className={styles.podcastTitle}>{show.title}</span>
                          <span className={styles.podcastPublisher}>{show.publisher}</span>
                          <p className={styles.podcastDesc}>{show.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.gallerySection}>
                  <div className={styles.sectionTitleRow}>
                    <h3 className={styles.sectionTitle}>Recent Episodes</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {MOCK_PODCAST_EPISODES.map((episode) => {
                      const isEpisodePlaying = currentTrack.id === episode.id && isPlaying;
                      return (
                        <div
                          key={episode.id}
                          className={styles.episodeRow}
                          onClick={() => playEpisode(episode)}
                        >
                          <div className={styles.episodeArt} style={{ background: episode.color }}>
                            {episode.label}
                          </div>
                          <div className={styles.episodeMeta}>
                            <span className={styles.episodeShowTitle}>{episode.showTitle}</span>
                            <span className={styles.episodeTitle}>{episode.title}</span>
                            <p className={styles.episodeDesc}>{episode.description}</p>
                          </div>
                          <div className={styles.episodeAction}>
                            <span>{formatTime(episode.duration)}</span>
                            <button
                              type="button"
                              className={styles.episodePlayBtn}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: isEpisodePlaying ? 'var(--accent-cyan)' : '#fff' }}
                            >
                              {isEpisodePlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            {/* LIBRARY TAB VIEW */}
            {activeTab === 'library' && (
              <>
                <section className={styles.gallerySection}>
                  <div className={styles.sectionTitleRow}>
                    <h3 className={styles.sectionTitle}>Liked Songs</h3>
                    {likedTrackIds.length > 0 && (
                      <button
                        type="button"
                        className={styles.playBtn}
                        onClick={() => {
                          const firstLiked = MOCK_TRACKS.find((t) => likedTrackIds.includes(t.id));
                          if (firstLiked) loadTrack(firstLiked);
                        }}
                      >
                        <Play size={16} fill="currentColor" /> Play All
                      </button>
                    )}
                  </div>

                  {likedTrackIds.length === 0 ? (
                    <div className={styles.likedSongsEmpty}>
                      <Heart size={48} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: '16px' }} />
                      <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Your library is empty</p>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px', maxWidth: '320px' }}>
                        Explore the catalog or search for your favorite tracks and click the heart icon to save them here.
                      </p>
                      <button
                        type="button"
                        className={styles.playBtn}
                        onClick={() => setActiveTab('find')}
                      >
                        Explore Music
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {MOCK_TRACKS.filter((t) => likedTrackIds.includes(t.id)).map((track) => (
                        <div
                          key={track.id}
                          onClick={() => loadTrack(track)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px 16px',
                            background: currentTrack.id === track.id ? 'rgba(0, 210, 243, 0.08)' : 'rgba(255,255,255,0.02)',
                            border: currentTrack.id === track.id ? '1px solid rgba(0, 210, 243, 0.3)' : '1px solid transparent',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            justifyContent: 'space-between',
                            transition: 'background 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '6px',
                                background: track.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.65rem',
                                flexShrink: 0
                              }}
                            >
                              {track.label}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: currentTrack.id === track.id ? 'var(--accent-cyan)' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {track.title}
                              </p>
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{track.artist}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLikeTrack(track.id);
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-cyan)', padding: '4px' }}
                              title="Unlike"
                            >
                              <Heart size={15} fill="currentColor" />
                            </button>
                            <span>{formatTime(track.duration)}</span>
                            {currentTrack.id === track.id && isPlaying ? (
                              <Pause size={16} style={{ color: 'var(--accent-cyan)' }} />
                            ) : (
                              <Play size={16} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {/* LYRICS TAB VIEW */}
            {activeTab === 'lyrics' && (
              <>
                <section className={styles.gallerySection}>
                  <div className={styles.sectionTitleRow}>
                    <h3 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mic size={20} style={{ color: 'var(--accent-cyan)' }} />
                      <span>Lyrics for &quot;{currentTrack.title}&quot;</span>
                    </h3>
                  </div>
                  <div 
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '16px',
                      padding: '40px 24px',
                      marginTop: '20px',
                      maxHeight: '60vh',
                      overflowY: 'auto',
                      textAlign: 'center',
                      fontFamily: 'var(--font-headings)',
                      whiteSpace: 'pre-line',
                      lineHeight: '2.2',
                      color: 'var(--text-primary)',
                      fontSize: '1.25rem',
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
                      scrollbarWidth: 'thin'
                    }}
                  >
                    {trackLyrics}
                  </div>
                </section>
              </>
            )}
          </>
        ) : (
          /* Search Results */
          <section className={styles.gallerySection}>
            <div className={styles.sectionTitleRow}>
              <h3 className={styles.sectionTitle} style={{ marginBottom: '20px' }}>
                Search Results {showApiResults ? (searchProvider === 'amazon' ? '(Amazon Music API)' : '(Free Catalog)') : ''} ({showApiResults ? searchResults.length : filteredTracks.length})
              </h3>
              {apiLoading && <div className={styles.spinner} style={{ width: '18px', height: '18px', borderTopColor: 'var(--accent-cyan)' }} />}
            </div>

            {apiError && (
              <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '16px' }}>{apiError}</p>
            )}

            {(showApiResults ? searchResults : filteredTracks).length > 0 ? (
              <div className={styles.cardGrid}>
                {(showApiResults ? searchResults : filteredTracks).map((track) => (
                  <div
                    key={track.id}
                    className={styles.albumCard}
                    onClick={() => loadTrack(track)}
                  >
                    <div className={styles.artWrapper}>
                      {track.imageUrl ? (
                        <img 
                          src={track.imageUrl} 
                          alt={track.title} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className={styles.albumArtCustom} style={{ background: track.color }}>
                          <Music2 size={24} className={styles.artIcon} />
                          <span className={styles.artLabel}>{track.label}</span>
                        </div>
                      )}
                      <div className={styles.cardPlayOverlay}>
                        <div className={styles.overlayPlayIcon}>
                          <Play size={20} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <div className={styles.albumMeta} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <span className={styles.albumName} style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</span>
                        <span className={styles.albumArtist} style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLikeTrack(track.id);
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: likedTrackIds.includes(track.id) ? 'var(--accent-cyan)' : 'var(--text-secondary)', padding: '4px', alignSelf: 'center' }}
                        title={likedTrackIds.includes(track.id) ? "Remove from Library" : "Save to Library"}
                      >
                        <Heart size={15} fill={likedTrackIds.includes(track.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !apiLoading && <p style={{ color: 'var(--text-secondary)' }}>No tracks found matching &quot;{searchQuery}&quot;.</p>
            )}
          </section>
        )}

        {/* Real-time Lyrics Panel */}
        {searchQuery === '' && trackLyrics && (
          <section className={`${styles.gallerySection} animate-slide-in`}>
            <div className={styles.sectionTitleRow} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              <h3 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ListMusic size={20} style={{ color: 'var(--accent-cyan)' }} />
                <span>Lyrics for &quot;{currentTrack.title}&quot;</span>
              </h3>
              <button 
                type="button"
                className={styles.seeAllLink}
                onClick={() => setShowLyrics(!showLyrics)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                {showLyrics ? 'Hide' : 'Show Lyrics'}
              </button>
            </div>
            
            {showLyrics && (
              <div 
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginTop: '16px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  textAlign: 'center',
                  fontFamily: 'var(--font-headings)',
                  whiteSpace: 'pre-line',
                  lineHeight: '2',
                  color: 'var(--text-primary)',
                  fontSize: '1.05rem',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                {trackLyrics}
              </div>
            )}
          </section>
        )}
      </main>

      {/* BOTTOM PLAYBACK BAR */}
      <footer className={styles.playerBar}>
        {/* Controls row */}
        <div className={styles.playerControlsRow}>
          {/* Track Detail (Left) */}
          <div 
            className={styles.nowPlaying} 
            onClick={() => setIsPlayerExpanded(true)}
            style={{ cursor: 'pointer' }}
            title="Expand Player"
          >
            {currentTrack.imageUrl ? (
              <img 
                src={currentTrack.imageUrl} 
                alt={currentTrack.title} 
                className={styles.miniArtCustom}
                style={{ objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className={styles.miniArtCustom} style={{ background: currentTrack.color }}>
                <span className={styles.miniArtLabel}>{currentTrack.label}</span>
              </div>
            )}
            <div className={styles.trackDetails}>
              <div className={styles.trackTitle} title={currentTrack.title}>
                {currentTrack.title}
              </div>
              <div className={styles.trackArtist} title={currentTrack.artist}>
                {currentTrack.artist}{currentTrack.albumName ? ` • ${currentTrack.albumName}` : ''}
              </div>
              <div className={styles.qualityBadge}>SD</div>
            </div>
            <button 
              type="button" 
              className={`${styles.iconBtn} ${likedTrackIds.includes(currentTrack.id) ? styles.iconBtnActive : ''}`} 
              onClick={(e) => { e.stopPropagation(); toggleLikeTrack(currentTrack.id); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              title={likedTrackIds.includes(currentTrack.id) ? "Remove from Library" : "Save to Library"}
            >
              <Heart size={16} fill={likedTrackIds.includes(currentTrack.id) ? "currentColor" : "none"} />
            </button>
            <button 
              type="button" 
              className={styles.iconBtn} 
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              title="More Options"
            >
              <span style={{ fontSize: '18px', fontWeight: 900, lineHeight: '1', display: 'inline-block', transform: 'translateY(-2px)' }}>...</span>
            </button>
          </div>

          {/* Music Playback Controls (Center - Amazon Music Style) */}
          <div className={styles.centerPlaybackSection}>
            <div className={styles.playbackButtonsRow}>
              <button
                type="button"
                className={`${styles.iconBtn} ${isRepeat ? styles.iconBtnActive : ''}`}
                onClick={() => setIsRepeat(!isRepeat)}
                title="Repeat"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Repeat size={16} />
              </button>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={handlePrevTrack}
                title="Previous"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <SkipBack size={18} />
              </button>
              <button
                type="button"
                className={styles.playToggleBtn}
                onClick={handlePlayPause}
                title={isPlaying ? 'Pause' : 'Play'}
                style={{ border: 'none', cursor: 'pointer' }}
              >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />}
              </button>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={handleNextTrack}
                title="Next"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <SkipForward size={18} />
              </button>
              <button
                type="button"
                className={`${styles.iconBtn} ${isShuffle ? styles.iconBtnActive : ''}`}
                onClick={() => setIsShuffle(!isShuffle)}
                title="Shuffle"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Shuffle size={16} />
              </button>
            </div>

            <div className={styles.progressSliderRow}>
              <span className={styles.timeLabel}>{formatTime(currentTime)}</span>
              <div
                className={styles.trackSliderWrapper}
                onClick={handleProgressBarClick}
              >
                <div className={styles.trackSliderBg}>
                  <div
                    className={styles.trackSliderFill}
                    style={{ width: `${(currentTime / (currentTrack.duration || 180)) * 100}%` }}
                  />
                </div>
                <div
                  className={styles.trackSliderThumb}
                  style={{ left: `${(currentTime / (currentTrack.duration || 180)) * 100}%` }}
                />
              </div>
              <span className={styles.timeLabel}>{formatTime(currentTrack.duration || 180)}</span>
            </div>
          </div>

          {/* Volume controls (Right) */}
          <div className={styles.extraControls}>
            <button 
              type="button" 
              className={`${styles.iconBtn} ${activeTab === 'lyrics' ? styles.iconBtnActive : ''}`}
              onClick={() => setActiveTab('lyrics')}
              title="Lyrics"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Mic size={16} />
            </button>
            <button type="button" className={styles.iconBtn} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <ListMusic size={18} />
            </button>
            <div className={styles.volumeWrapper}>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={toggleMute}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <div
                className={styles.volumeSliderBg}
                ref={volumeSliderRef}
                onClick={handleVolumeClick}
              >
                <div
                  className={styles.volumeSliderFill}
                  style={{ width: `${volume * 100}%` }}
                />
              </div>
            </div>
            <button 
              type="button" 
              className={styles.iconBtn} 
              onClick={() => setIsPlayerExpanded(true)} 
              title="Expand Player"
              style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '8px' }}
            >
              <Maximize2 size={14} style={{ opacity: 0.7 }} />
            </button>
          </div>
        </div>
      </footer>

      {/* API Settings Modal */}
      {showSettings && (
        <div className={styles.settingsOverlay}>
          <div className={styles.settingsCard}>
            <div className={styles.settingsHeader}>
              <h3 className={styles.settingsTitle}>Amazon Music API Settings</h3>
              <button 
                type="button" 
                className={styles.settingsClose} 
                onClick={() => setShowSettings(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form 
              className={styles.settingsForm}
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const token = formData.get('token') as string;
                const url = formData.get('url') as string;
                const provider = formData.get('searchProvider') as 'amazon' | 'free';
                
                localStorage.setItem('amz_search_provider', provider);
                setSearchProvider(provider);
                handleSaveSettings(token, url);
              }}
            >
              <div className={styles.settingsGroup}>
                <label className={styles.settingsLabel} htmlFor="searchProviderSelect">
                  Search & Streaming Provider
                </label>
                <select
                  id="searchProviderSelect"
                  name="searchProvider"
                  defaultValue={searchProvider}
                  className={styles.settingsInput}
                  style={{ 
                    background: '#1c1c1e', 
                    color: '#fff', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    cursor: 'pointer',
                    borderRadius: '6px',
                    padding: '8px'
                  }}
                >
                  <option value="free">Free Catalog (iTunes Open API - No Token Needed)</option>
                  <option value="amazon">Amazon Music API (Requires Access Token)</option>
                </select>
              </div>

              <div className={styles.settingsGroup}>
                <label className={styles.settingsLabel} htmlFor="apiUrlInput">
                  API Base URL
                </label>
                <input
                  id="apiUrlInput"
                  name="url"
                  type="url"
                  defaultValue={apiUrl}
                  className={styles.settingsInput}
                  placeholder="https://amz.dezalty.com"
                  required
                />
              </div>

              <div className={styles.settingsGroup}>
                <label className={styles.settingsLabel} htmlFor="apiTokenInput">
                  API Access Token
                </label>
                <input
                  id="apiTokenInput"
                  name="token"
                  type="password"
                  defaultValue={apiToken}
                  className={styles.settingsInput}
                  placeholder="Paste your API token here"
                />
                <span className={styles.settingsInfoText}>
                  Don&apos;t have a token? Star the repository on GitHub, then{' '}
                  <a 
                    href="https://amz.dezalty.com/login" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.settingsLink}
                  >
                    Click Here to Get Auth Tokens
                  </a>.
                </span>
              </div>

              <div className={styles.settingsActions}>
                <button
                  type="button"
                  onClick={handleClearSettings}
                  className={`${styles.settingsBtn} ${styles.settingsBtnClear}`}
                >
                  Clear Config
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className={`${styles.settingsBtn} ${styles.settingsBtnCancel}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.settingsBtn} ${styles.settingsBtnSave}`}
                >
                  Save Config
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HTML5 Audio Node - events bound via useEffect for stability */}
      <audio ref={audioRef} />

      {/* Hidden YouTube Player Iframe Container */}
      <div 
        id="yt-player-container" 
        style={{ 
          position: 'absolute', 
          width: '200px', 
          height: '200px', 
          opacity: 0, 
          pointerEvents: 'none', 
          zIndex: -9999,
          bottom: 0,
          left: 0
        }} 
      />

      {/* EXPANDED PLAYER OVERLAY (AMAZON MUSIC STYLE) */}
      {isPlayerExpanded && (
        <div className={styles.expandedOverlay}>
          {/* Blurred Background Artwork */}
          <div 
            className={styles.expandedOverlayBg} 
            style={{ backgroundImage: `url(${currentTrack.imageUrl})` }}
          />

          {/* Expanded Top Header */}
          <header className={styles.expandedHeader}>
            <button 
              type="button" 
              className={styles.expandedCloseBtn}
              onClick={() => setIsPlayerExpanded(false)}
              title="Minimize Player"
            >
              <ChevronDown size={32} />
            </button>
            <div className={styles.expandedHeaderTitle}>
              Now Playing
            </div>
            <div style={{ width: '32px' }} /> {/* Spacer to align title */}
          </header>

          {/* Expanded Content Area (artwork + optional lyrics) */}
          <div className={`${styles.expandedContent} ${showSyncedLyrics ? styles.splitScreen : ''}`}>
            {/* Left Side: Artwork & Metadata */}
            <div className={styles.expandedLeftPanel}>
              <div className={styles.expandedArtWrapper}>
                <img 
                  src={currentTrack.imageUrl} 
                  alt={currentTrack.title} 
                  className={styles.expandedArtwork}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&h=600&fit=crop';
                  }}
                />
              </div>
              <div className={styles.expandedMetadata}>
                <span className={styles.expandedQualityBadge}>SD</span>
                <h2 className={styles.expandedTitle} title={currentTrack.title}>
                  {currentTrack.title}
                </h2>
                <p className={styles.expandedArtist} title={currentTrack.artist}>
                  {currentTrack.artist}{currentTrack.albumName ? ` • ${currentTrack.albumName}` : ''}
                </p>
              </div>
            </div>

            {/* Right Side: Scrollable Lyrics (if toggled) */}
            {showSyncedLyrics && (
              <div className={styles.expandedRightPanel}>
                <div className={styles.expandedLyricsHeader}>
                  <Mic size={18} style={{ color: 'var(--accent-cyan)' }} />
                  <span>Lyrics</span>
                </div>
                <div className={styles.expandedLyricsScroll}>
                  {trackLyrics || "Lyrics not available for this track."}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Section: Controls & Progress */}
          <div className={styles.expandedBottomControls}>
            {/* Progress Slider Wrapper */}
            <div className={styles.expandedSliderContainer}>
              <div 
                className={styles.expandedSliderWrapper}
                onClick={handleProgressBarClick}
              >
                <div className={styles.expandedSliderBg}>
                  <div 
                    className={styles.expandedSliderFill} 
                    style={{ width: `${(currentTime / currentTrack.duration) * 100}%` }}
                  />
                </div>
                <div 
                  className={styles.expandedSliderThumb}
                  style={{ left: `${(currentTime / currentTrack.duration) * 100}%` }}
                />
              </div>
              
              <div className={styles.expandedTimeRow}>
                <span>{formatTime(currentTime)}</span>
                <span>-{formatTime(Math.max(0, currentTrack.duration - currentTime))}</span>
              </div>
            </div>

            {/* Controls Button Row */}
            <div className={styles.expandedControlsRow}>
              {/* Left Group: Liked Heart & Context Menu */}
              <div className={styles.expandedControlsLeft}>
                <button
                  type="button"
                  className={`${styles.expandedIconBtn} ${likedTrackIds.includes(currentTrack.id) ? styles.expandedIconBtnActive : ''}`}
                  onClick={() => toggleLikeTrack(currentTrack.id)}
                  title={likedTrackIds.includes(currentTrack.id) ? "Remove from Library" : "Save to Library"}
                >
                  <Heart size={22} fill={likedTrackIds.includes(currentTrack.id) ? "currentColor" : "none"} />
                </button>
                <button type="button" className={styles.expandedIconBtn} title="More Options">
                  <span style={{ fontSize: '20px', fontWeight: 900 }}>...</span>
                </button>
              </div>

              {/* Center Group: Repeat, Prev, Play/Pause, Next, Shuffle */}
              <div className={styles.expandedControlsCenter}>
                <button
                  type="button"
                  className={`${styles.expandedIconBtn} ${isRepeat ? styles.expandedIconBtnActive : ''}`}
                  onClick={() => setIsRepeat(!isRepeat)}
                  title={isRepeat ? "Repeat Off" : "Repeat All"}
                >
                  <Repeat size={20} />
                </button>
                <button
                  type="button"
                  className={styles.expandedIconBtn}
                  onClick={handlePrevTrack}
                  title="Previous"
                >
                  <SkipBack size={24} fill="currentColor" />
                </button>
                <button
                  type="button"
                  className={styles.expandedPlayBtn}
                  onClick={handlePlayPause}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" style={{ marginLeft: '4px' }} />}
                </button>
                <button
                  type="button"
                  className={styles.expandedIconBtn}
                  onClick={handleNextTrack}
                  title="Next"
                >
                  <SkipForward size={24} fill="currentColor" />
                </button>
                <button
                  type="button"
                  className={`${styles.expandedIconBtn} ${isShuffle ? styles.expandedIconBtnActive : ''}`}
                  onClick={() => setIsShuffle(!isShuffle)}
                  title="Shuffle"
                >
                  <Shuffle size={20} />
                </button>
              </div>

              {/* Right Group: Volume Slider & Lyrics Toggle */}
              <div className={styles.expandedControlsRight}>
                <div className={styles.expandedVolumeRow}>
                  <button type="button" className={styles.expandedIconBtn} onClick={toggleMute}>
                    {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className={styles.expandedVolumeSlider}
                  />
                </div>
                <button
                  type="button"
                  className={`${styles.expandedIconBtn} ${showSyncedLyrics ? styles.expandedIconBtnActive : ''}`}
                  onClick={() => setShowSyncedLyrics(!showSyncedLyrics)}
                  title="Toggle Lyrics"
                >
                  <ListMusic size={22} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
