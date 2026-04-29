import { useState, useEffect, useRef } from "react";
import { getLatestPodcastEpisode } from "../api/cms";
import { PodcastEpisode } from "../types";

/* ── YouTube Video Data ── */
// ... (rest of imports)
const featuredVideos = [
  {
    id: "sOK_OgmKUDo",
    title: "The 40-Hour Trap: Control or Productivity?",
    category: "Society",
    duration: "12:45",
  },
  {
    id: "QPFDXPlDToo",
    title: "This Is Why You Feel Broke Despite The Bull Market",
    category: "Economics",
    duration: "08:30",
  },
  {
    id: "Cs_GcmdqkWM",
    title: "Trump Didn't Win the Nobel Peace Prize – Here's Why",
    category: "Geopolitics",
    duration: "15:20",
  },
  {
    id: "fq3uXtyqUU0",
    title: "Part 2 The Real Reason Tech Companies Fear Open-Source AI",
    category: "Technology",
    duration: "10:15",
  },
  {
    id: "dH6v4HdAb08",
    title: "The FUTURE of AI Is Being Shaped by MONEY, POWER and CONTROL",
    category: "Technology",
    duration: "14:50",
  },
];

const channelStats = [
  { value: "2M+", label: "Total Views" },
  { value: "150+", label: "Investigations" },
  { value: "47", label: "Countries Covered" },
];

const milestones = [
  { year: "2024", event: <>Started <strong>Us In Context</strong> to break down political and economic issues with clearer context beyond headlines.</> },
  { year: "Early 2025", event: <>Began publishing consistent content focused on simplifying complex topics and improving with each release.</> },
  { year: "Now", event: <>Refining the platform while developing the <strong>Novus Ecosystem Apps</strong> to expand how content, ideas, and tools connect.</> },
  { year: "Next", event: <>Expanding the content and sharpening the message to deliver analysis that actually matters and holds value over time.</> },
];

/* ── Animated counter hook ── */
function useCounter(target: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = target / (duration / 16);
          const animate = () => {
            start += step;
            if (start >= target) {
              setCount(target);
              return;
            }
            setCount(Math.floor(start));
            requestAnimationFrame(animate);
          };
          animate();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, startOnView]);
  return { count, ref };
}

/* ── Video Player Card ── */
function VideoCard({
  video,
  isActive,
  onClick,
}: {
  video: (typeof featuredVideos)[0];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group w-full text-left rounded-xl overflow-hidden transition-all duration-300 ${
        isActive
          ? "ring-2 ring-red-500 bg-white/[0.08] scale-[1.02]"
          : "bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20"
      }`}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isActive
                ? "bg-red-600 scale-110"
                : "bg-white/20 backdrop-blur-sm group-hover:bg-red-600 group-hover:scale-110"
            }`}
          >
            {isActive ? (
              <div className="flex items-center gap-0.5">
                <div className="w-1 h-4 bg-white rounded-full animate-pulse" />
                <div
                  className="w-1 h-3 bg-white rounded-full animate-pulse"
                  style={{ animationDelay: "0.15s" }}
                />
                <div
                  className="w-1 h-5 bg-white rounded-full animate-pulse"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            ) : (
              <svg
                className="w-5 h-5 text-white ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>
        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
          {video.duration}
        </span>
      </div>
      <div className="p-3">
        <span className="text-red-400 text-[10px] font-bold uppercase tracking-[0.15em]">
          {video.category}
        </span>
        <p
          className={`text-sm font-semibold mt-1 line-clamp-2 transition-colors ${
            isActive ? "text-white" : "text-gray-300 group-hover:text-white"
          }`}
        >
          {video.title}
        </p>
      </div>
    </button>
  );
}

/**
 * AboutSection Component
 * 
 * Renders the "About" section of the home page. It includes the mission statement, 
 * animated channel statistics, a YouTube video showcase with a playlist, a timeline 
 * of the company's journey, and a grid of core values.
 */
export default function AboutSection() {
  const [activeVideo, setActiveVideo] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [latestPodcast, setLatestPodcast] = useState<PodcastEpisode | null>(null);
  
  const views = useCounter(2, 1500);
  const investigations = useCounter(150, 2000);
  const countries = useCounter(47, 1600);

  /* Fetch Podcast Data */
  useEffect(() => {
    const fetchPodcast = async () => {
      const ep = await getLatestPodcastEpisode();
      setLatestPodcast(ep);
    };
    fetchPodcast();
  }, []);

  /* Intersection observer for fade-in animations */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll("[data-about-animate]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const fadeClass = (id: string) =>
    `transition-all duration-700 ${
      visibleSections.has(id)
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-6"
    }`;

  const currentVideo = featuredVideos[activeVideo];

  return (
    <section id="about" className="relative bg-black overflow-hidden w-full">
      {/* ═══════ Background Effects ═══════ */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-600/[0.06] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-800/[0.04] rounded-full blur-[100px]" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

      {/* ── Mission Intro ── */}
      <div className="relative py-24 border-b border-white/[0.06]">
        <div
          id="about-intro"
          data-about-animate
          className={`max-w-7xl mx-auto px-6 ${fadeClass("about-intro")}`}
        >
          <div className="grid lg:grid-cols-[1fr_0.4fr] gap-12 items-center">
            <div className="pr-0 lg:pr-12">
              <p className="text-red-500 text-xs font-bold tracking-[0.22em] uppercase mb-4 flex items-center gap-2">
                <span className="w-6 h-px bg-red-500" />
                Our Mission
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1] mb-6">
                We Don't Just Report<br />
                The News. We <span className="text-red-500">Decode</span> It.
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed mb-8">
                <p>
                  Novus Exchange is an investigative media platform built for a generation that
                  refuses to be fed narratives. We combine deep geopolitical research, data-driven
                  analysis, and fearless journalism to expose the forces shaping our world.
                </p>
                <p className="text-gray-500">
                  From uncovering hidden economic networks to tracking surveillance policy across
                  global borders, our mission is simple: arm you with the truth before anyone else
                  shapes it for you.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <a
                  href="/podcast"
                  className="inline-flex items-center gap-2.5 px-6 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-[0.14em] rounded-lg hover:bg-red-700 transition-colors group shadow-lg shadow-red-600/20"
                >
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1v11m4.22-5.78l-.78.78A7 7 0 106.56 12l-.78-.78m12.44 0a7 7 0 010 9.56M5.78 5.78a7 7 0 010 9.56M12 1a4 4 0 110 8 4 4 0 010-8z" />
                  </svg>
                  Listen to Podcast
                </a>
                <a
                  href="#solutions"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white text-xs font-bold uppercase tracking-[0.14em] rounded-lg hover:bg-white/10 transition-colors"
                >
                  Explore Ecosystem
                </a>
              </div>
            </div>

            {/* Mission Podcast Content - Stylized Card matching Image 1 */}
            <div className="relative lg:mt-0 mt-8 group">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 aspect-[9/10] max-h-[420px] mx-auto lg:mx-0 shadow-2xl transition-transform duration-500 hover:scale-[1.02] cursor-pointer">
                {/* Podcast Thumbnail - Coins/Wallet theme from Screenshot */}
                <img 
                  src={latestPodcast?.thumbnailUrl || "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=2070&auto=format&fit=crop"} 
                  alt="Podcast Thumbnail" 
                  className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Audio Waveform Animation Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="flex items-end gap-1 px-4 py-8 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
                    {[0, 1, 2, 3, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2].map((h, i) => (
                      <div 
                        key={i} 
                        className="w-1 bg-red-500 rounded-full animate-pulse" 
                        style={{ height: `${10 + h * 6}px`, animationDelay: `${i * 0.05}s` }} 
                      />
                    ))}
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                
                <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex px-1.5 py-0.5 bg-red-600 rounded-sm text-[8px] font-black uppercase tracking-widest text-white">
                      New Episode
                    </div>
                    <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest">
                      // {latestPodcast?.duration || "42:00"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    <span className="text-red-400 text-[9px] font-black uppercase tracking-[0.3em]">
                      Signal Active
                    </span>
                  </div>
                  
                  <p className="text-white font-black text-xs mt-2 uppercase tracking-widest leading-tight">
                    Ep. {latestPodcast?.episodeNumber || "42"}: {latestPodcast?.title || "Decoding Intelligence"}
                  </p>
                </div>
                
                {/* Play Button */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Agency Tag Overlay (from image) */}
              <div className="absolute -bottom-4 -right-4 bg-[#0d0d0d] border border-white/10 rounded-lg p-3 shadow-2xl hidden lg:block z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-red-600/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-[10px] uppercase tracking-wider">Independent Agency</p>
                    <p className="text-gray-500 text-[9px] uppercase tracking-widest">Status: Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ YouTube Video Showcase ═══════ */}
      <div className="relative py-24 border-b border-white/[0.06]">
        <div
          id="about-videos"
          data-about-animate
          className={`max-w-7xl mx-auto px-6 ${fadeClass("about-videos")}`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-red-500 text-xs font-bold tracking-[0.22em] uppercase mb-3 flex items-center gap-2">
                <span className="w-6 h-px bg-red-500" />
                Watch Our Investigations
              </p>
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Deep Dives on YouTube
              </h3>
            </div>
            <a
              href="https://www.youtube.com/@novusexchange"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-red-400 text-sm font-semibold hover:text-red-300 transition-colors group"
            >
              View All Videos
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Main Video Player */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 shadow-2xl shadow-red-900/10">
                <div className="aspect-video">
                  <iframe
                    key={currentVideo.id + activeVideo}
                    src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&mute=1&loop=1&playlist=${currentVideo.id}&rel=0&modestbranding=1&color=red`}
                    title={currentVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-5 border-t border-white/[0.06]">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-red-400 text-[10px] font-bold uppercase tracking-[0.15em] bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                      {currentVideo.category}
                    </span>
                    <span className="text-gray-600 text-xs font-mono">{currentVideo.duration}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white">{currentVideo.title}</h4>
                </div>
              </div>
            </div>

            {/* Video Sidebar List */}
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1 scrollbar-thin">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-2 sticky top-0 bg-black py-2 z-10">
                Up Next
              </p>
              {featuredVideos.map((video, i) => (
                <VideoCard
                  key={i}
                  video={video}
                  isActive={activeVideo === i}
                  onClick={() => setActiveVideo(i)}
                />
              ))}
            </div>
          </div>

          {/* Subscribe CTA */}
          <div className="mt-10 p-6 md:p-8 rounded-2xl border border-white/10 bg-gradient-to-r from-red-950/30 via-red-900/10 to-transparent relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_50%,rgba(220,38,38,0.15),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-600/30">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.4 5 12 5 12 5s-4.4 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.5 2 11v1.5c0 1.5.2 3 .2 3s.2 1.4.8 2c.8.8 1.8.8 2.2.9C6.6 18.5 12 18.5 12 18.5s4.4 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.5.2-3V11c0-1.5-.2-3-.2-3zM9.7 14.5V9l5.4 2.8-5.4 2.7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">Never Miss an Investigation</h4>
                  <p className="text-gray-400 text-sm">
                    Subscribe and turn on notifications. New deep dives drop every week.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.youtube.com/@novusexchange"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-[0.14em] rounded-lg hover:bg-red-700 transition-all hover:shadow-lg hover:shadow-red-600/25 whitespace-nowrap"
                >
                  Subscribe Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ Timeline & Values (Side by Side) ═══════ */}
      <div className="relative py-24 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            
            {/* Left: Timeline */}
            <div id="about-timeline" data-about-animate className={`${fadeClass("about-timeline")}`}>
              <div className="mb-12">
                <p className="text-red-500 text-xs font-bold tracking-[0.22em] uppercase mb-3">
                  Our Journey
                </p>
                <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  From Newsletter to Newsroom
                </h3>
              </div>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-red-500/40 via-white/10 to-transparent" />
                {milestones.map((m, i) => (
                  <div key={m.year} className="relative flex items-start gap-6 mb-10 last:mb-0">
                    {/* Dot */}
                    <div
                      className="absolute left-4 w-3 h-3 rounded-full bg-red-500 border-2 border-black z-10"
                      style={{ transform: "translate(-50%, 6px)" }}
                    />
                    {/* Content */}
                    <div className="ml-10">
                      <span className="text-red-400 text-xs font-bold tracking-[0.2em] uppercase">
                        {m.year}
                      </span>
                      <p className="text-gray-300 text-sm leading-relaxed mt-1">{m.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Values */}
            <div id="about-values" data-about-animate className={`${fadeClass("about-values")}`}>
              <div className="mb-12">
                <p className="text-red-500 text-xs font-bold tracking-[0.22em] uppercase mb-3">
                  Core Principles
                </p>
                <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  What Drives Us
                </h3>
              </div>
              <div className="flex flex-col gap-6">
                {[
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ),
                    title: "Radical Transparency",
                    desc: "Every claim is sourced. Every analysis is traceable. We show our work because trust isn't given — it's earned.",
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                      </svg>
                    ),
                    title: "Independence First",
                    desc: "No corporate sponsors. No partisan backing. We answer to our readers and the truth — nothing else.",
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                      </svg>
                    ),
                    title: "Built to Disrupt",
                    desc: "From our SaaS tools to our reporting, we challenge the status quo. If it's broken, we expose it. If it can be better, we build it.",
                  },
                ].map((value) => (
                  <div
                    key={value.title}
                    className="relative p-6 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15 transition-all duration-300 group flex items-start gap-5"
                  >
                    <div className="w-12 h-12 shrink-0 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:bg-red-500/20 transition-colors">
                      {value.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">{value.title}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{value.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
