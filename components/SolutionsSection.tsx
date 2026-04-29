import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

type Product = {
  id: string;
  name: string;
  slug: string;
  stage: string;
  summary: string;
  audience: string;
  waitlist: string;
  image: string;
  highlights: string[];
  subtitle?: string;
  videoUrl?: string;
  gallery?: string[];
  specs?: Record<string, string>;
};

type Testimonial = {
  quote: string;
  author: string;
};

type FAQ = {
  question: string;
  answer: string;
};

/**
 * SolutionsSection Component
 * 
 * Renders the "Novus Ecosystem" section of the home page. It displays the SaaS 
 * products being built by Novus Exchange, fetching data from Supabase. It includes 
 * product details, waitlist signup forms, testimonials, and FAQs.
 */
export default function SolutionsSection() {
  const [openFaq, setOpenFaq] = useState(0);
  const [activeWaitlist, setActiveWaitlist] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeGallery, setActiveGallery] = useState<Product | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0); // To cycle the main preview card too

  useEffect(() => {
    // Auto-cycle the first product's gallery for a "live hub" feel
    const interval = setInterval(() => {
      setActiveGalleryIndex((prev) => (prev + 1) % 4); 
    }, 3000); // Faster rotation as requested
    return () => clearInterval(interval);
  }, []);

  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const [products, setProducts] = useState<Product[]>([
    {
      id: "content-hub",
      name: "Content Hub CMS",
      subtitle: "Headless CMS",
      slug: "content-hub",
      stage: "Early Access",
      summary: "Manage, schedule, and optimise your content across all platforms with AI-powered automation and real-time analytics.",
      audience: "For creators, digital agencies, and enterprise teams",
      waitlist: "Join 1,200+ others",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop", 
      highlights: ["AI Content Creation & Distribution", "Smart Editorial Multi-Calendar", "Omni-channel Publishing Automation"],
      gallery: [
        "/migrated_prompt_history/image_0.png", // Overview Dashboard
        "/migrated_prompt_history/image_1.png", // Analytics & Velocity
        "/migrated_prompt_history/image_2.png", // Calendar Orchestrator
        "/migrated_prompt_history/image_3.png"  // Content Pipeline
      ],
      specs: {
        "ARCHITECTURE": "Global Headless API",
        "INTEGRATIONS": "Instagram, YouTube, X, Webhooks",
        "AI ENGINE": "Novus Intelligence Core",
        "UPTIME": "99.99% Enterprise SLA"
      }
    },
    {
      id: "signal-stream",
      name: "ContentFlow PRO",
      slug: "contentflow-pro",
      stage: "Early Access",
      summary: "The high-fidelity command center for modern creators. Automate your entire workflow from idea generation to global publishing.",
      audience: "For creators, media teams, and publishing operations",
      waitlist: "Join 850+ others",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
      highlights: ["Unified Content Pipeline Control", "Internal Script Synthesis Engine", "Global Distribution Intelligence"],
      videoUrl: "https://player.vimeo.com/external/494252666.sd.mp4?s=6c2ef6a87754563836d506d860d5c808728d8b6c&profile_id=164" 
    },
    {
      id: "novus-os",
      name: "Novus OS",
      slug: "novus-os",
      stage: "In Development",
      summary: "Enterprise-grade command center for multi-brand media organizations with governance, security, and workflow controls.",
      audience: "For larger agencies and enterprise partners",
      waitlist: "Join 430+ others",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop",
      highlights: ["Role-Based Access Governance", "Multi-brand Orchestration Hub", "Audit-Ready Security Log Tracking"]
    }
  ]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      quote: "Orbit Desk helped us cut research time in half during live geopolitical events. It feels built by people who understand news pressure.",
      author: "LEAD ANALYST, POLICYWATCH"
    },
    {
      quote: "Signal Stream is already replacing three disconnected tools in our workflow. The multilingual support is shockingly good.",
      author: "EDITORIAL DIRECTOR, FRONTIER BRIEF"
    },
    {
      quote: "What stands out is the architectural honesty. It reflects the same editorial rigor Novus applies to reporting.",
      author: "FOUNDER, ATLAS MEDIA LAB"
    }
  ]);
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      question: "When will these tools be available to the public?",
      answer: "We are currently rolling out access in phases. Orbit Desk is in private beta for select partners, and Signal Stream is entering early access. You can join the waitlist for any product to be notified when spots open up."
    },
    {
      question: "Are these tools built for independent creators or large newsrooms?",
      answer: "Both. While Novus OS is designed for enterprise-scale operations, tools like Signal Stream and Orbit Desk have tiers that cater to independent researchers, creators, and boutique media teams."
    },
    {
      question: "How does the pricing work?",
      answer: "Pricing will be announced closer to public launch. We plan to offer a mix of seat-based subscriptions for teams and usage-based tiers for independent creators."
    }
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Supabase fetching disabled to maintain code-defined source of truth
    setIsLoading(false);
  }, []);

  const handleWaitlistSubmit = async (e: React.FormEvent, solutionSlug: string) => {
    e.preventDefault();
    if (!waitlistEmail) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage("");

    try {
      const { data, error } = await supabase.functions.invoke('submit-waitlist', {
        body: { 
          email: waitlistEmail, 
          solutionSlug,
          source: 'solutions_page' 
        }
      });

      if (error) throw error;
      
      setSubmitStatus('success');
      setTimeout(() => {
        setActiveWaitlist(null);
        setWaitlistEmail("");
        setSubmitStatus('idle');
      }, 3000);
    } catch (err: any) {
      console.error('Waitlist submission error:', err);
      setSubmitStatus('error');
      setErrorMessage(err.message || 'Failed to join waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="solutions" className="relative py-32 bg-black w-full overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(220,38,38,0.12),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(220,38,38,0.08),transparent_40%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/35 to-transparent shadow-[0_0_20px_rgba(239,44,44,0.1)]" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-24">
          <p className="text-red-500 text-[10px] font-black tracking-[0.4em] uppercase mb-6">System Ecosystem</p>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1.05] mb-8 uppercase italic">
            Software Built From <br className="hidden md:block" /> The Newsroom
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl font-medium">
            Novus Exchange is our investigative media platform. Our SaaS products are the execution layer: tools created from the original editorial workflows we use to research, verify, and publish high-stakes reporting.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left mb-32">
          <div className="border border-white/5 bg-white/[0.01] rounded-2xl px-10 py-10 transition-all hover:bg-white/[0.03] hover:border-red-500/20 group text-center">
            <p className="text-4xl font-black text-white mb-2 group-hover:text-red-500 transition-colors italic">---</p>
            <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-600">Total System Waitlist</p>
          </div>
          <div className="border border-white/5 bg-white/[0.01] rounded-2xl px-10 py-10 transition-all hover:bg-white/[0.03] hover:border-red-500/20 group text-center">
            <p className="text-4xl font-black text-white mb-2 group-hover:text-red-500 transition-colors italic">---</p>
            <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-600">Core Tools In Build</p>
          </div>
          <div className="border border-white/5 bg-white/[0.01] rounded-2xl px-10 py-10 transition-all hover:bg-white/[0.03] hover:border-red-500/20 group text-center">
            <p className="text-4xl font-black text-white mb-2 group-hover:text-red-500 transition-colors italic flex items-center justify-center md:justify-start gap-1">
              LIVE
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            </p>
            <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-600">30-Day Beta Retention</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-40">
            {products.map((product, index) => (
              <article
                key={product.name}
                className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center"
              >
                <div className={`${index % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className="relative overflow-hidden rounded-[2.5rem] border border-white/15 bg-[#0a0a0a] group/media shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]">
                    {product.videoUrl ? (
                      <div className="relative w-full aspect-[16/10]">
                        <video
                          src={product.videoUrl}
                          autoPlay
                          muted
                          loop
                          playsInline
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover opacity-80 group-hover/media:opacity-100 transition-opacity duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity duration-500 scale-90 group-hover/media:scale-100">
                           <div className="w-16 h-16 rounded-full bg-red-600/30 border border-red-500/50 flex items-center justify-center backdrop-blur-md">
                              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,44,44,0.6)]" />
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full aspect-[16/10] overflow-hidden">
                        <img
                          src={product.gallery ? product.gallery[activeGalleryIndex] : product.image}
                          alt={`${product.name} product preview`}
                          className="w-full h-full object-cover opacity-90 group-hover/media:opacity-100 transition-all duration-1000 scale-100 group-hover/media:scale-110"
                        />
                        {product.gallery && (
                          <div className="absolute bottom-6 right-8 flex gap-2 z-20">
                            {product.gallery.map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-2 h-2 rounded-full transition-all duration-500 ${activeGalleryIndex === i ? 'bg-red-500 w-8' : 'bg-white/20'}`} 
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="absolute left-8 bottom-8 flex items-center gap-3 text-[10px] text-white uppercase tracking-[0.25em] font-black bg-black/80 backdrop-blur-2xl px-5 py-2.5 rounded-full border border-white/10 z-10 shadow-2xl">
                      <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      {product.videoUrl ? 'System Live View' : 'Proprietary CMS'}
                    </div>
                  </div>
                </div>
                
                <div className={`${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="flex items-center gap-4 mb-8">
                    <span className="px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                      {product.stage}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 italic opacity-80">{product.waitlist}</span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 uppercase italic leading-none">{product.name}</h3>
                  {product.subtitle && (
                    <p className="text-red-500 text-[11px] font-black tracking-[0.4em] uppercase mb-8 opacity-80">{product.subtitle}</p>
                  )}
                  <p className="text-gray-400 text-lg leading-relaxed mb-10 font-medium">{product.summary}</p>
                  
                  <ul className="space-y-6 mb-12">
                    {product.highlights.map((item) => (
                      <li key={item} className="flex items-center gap-6 text-gray-300 group/item">
                        <div className="h-px w-8 bg-red-500/30 group-hover/item:w-16 transition-all duration-500 group-hover/item:bg-red-500" />
                        <span className="text-xs font-black uppercase tracking-[0.25em] group-hover:text-white transition-colors">{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {activeWaitlist === product.slug ? (
                    <form onSubmit={(e) => handleWaitlistSubmit(e, product.slug)} className="space-y-6 max-w-md">
                      <div className="flex gap-2 p-1.5 bg-white/[0.02] border border-white/10 rounded-[1.25rem] focus-within:border-red-500/50 transition-all shadow-2xl">
                        <input 
                          type="email" 
                          required
                          placeholder="ACCESS_IDENTITY@DOMAIN.COM"
                          value={waitlistEmail}
                          onChange={(e) => setWaitlistEmail(e.target.value)}
                          disabled={isSubmitting}
                          className="flex-1 bg-transparent px-5 py-3.5 text-xs font-bold text-white outline-none placeholder:text-gray-700 disabled:opacity-50 tracking-widest"
                        />
                        <button 
                          type="submit"
                          disabled={isSubmitting}
                          className="px-10 py-3.5 text-[10px] font-black tracking-[0.3em] uppercase rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all active:scale-95 disabled:bg-red-900 shadow-lg shadow-red-600/20"
                        >
                          {isSubmitting ? 'SECURE_SYNC' : 'APPLY'}
                        </button>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => { setActiveWaitlist(null); setSubmitStatus('idle'); }}
                        className="text-[9px] font-black text-gray-600 hover:text-red-500 uppercase tracking-[0.4em] px-1 transition-all flex items-center gap-2 group"
                      >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Specs
                      </button>
                    </form>
                  ) : (
                    <div className="flex flex-wrap gap-5">
                      {product.videoUrl ? (
                         <button 
                            onClick={() => setActiveVideo(product.videoUrl!)}
                            className="px-10 py-5 text-[10px] font-black tracking-[0.25em] uppercase rounded-xl border border-white/15 text-white hover:bg-white/5 transition-all active:scale-95 hover:border-white/30"
                          >
                            Internal Alpha Stream
                          </button>
                      ) : product.gallery ? (
                        <button 
                          onClick={() => { setActiveGallery(product); setGalleryIndex(0); }}
                          className="px-10 py-5 text-[10px] font-black tracking-[0.25em] uppercase rounded-xl border border-white/15 text-white hover:bg-white/5 transition-all active:scale-95 hover:border-white/30"
                        >
                          System Components
                        </button>
                      ) : (
                        <button 
                          disabled
                          className="px-10 py-5 text-[10px] font-black tracking-[0.25em] uppercase rounded-xl border border-white/5 text-white/10 cursor-not-allowed italic"
                        >
                          Access Restricted
                        </button>
                      )}
                      
                      <button 
                        onClick={() => setActiveWaitlist(product.slug)}
                        className="px-10 py-5 text-[10px] font-black tracking-[0.25em] uppercase rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all shadow-[0_15px_30px_-10px_rgba(220,38,38,0.4)] active:scale-95"
                      >
                        Request Access Tier
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {testimonials.length > 0 && (
          <div className="mt-40">
             <div className="flex justify-center mb-16">
               <div className="px-6 py-2 border border-white/10 bg-white/[0.02] rounded-full">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">System Beta Feedback</p>
               </div>
             </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <blockquote key={testimonial.author} className="border border-white/10 bg-white/[0.02] rounded-[2rem] p-10 relative group hover:border-red-500/30 transition-all duration-500 shadow-2xl">
                  <span className="text-4xl font-serif text-red-600/30 absolute top-8 left-8">“</span>
                  <p className="text-gray-300 text-lg leading-relaxed mb-8 italic relative z-10">"{testimonial.quote}"</p>
                  <footer className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 pt-6 border-t border-white/5">{testimonial.author}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        )}

        {faqs.length > 0 && (
          <div className="mt-24 max-w-4xl">
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-8">Solutions FAQ</h3>
            <div className="divide-y divide-white/10 border border-white/10 rounded-2xl bg-white/[0.03] overflow-hidden">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={faq.question}>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between text-left px-5 py-4"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    >
                      <span className="text-white font-semibold pr-4">{faq.question}</span>
                      <span className="text-red-400 text-xl leading-none">{isOpen ? "-" : "+"}</span>
                    </button>
                    {isOpen && <p className="px-5 pb-5 text-gray-400 leading-relaxed">{faq.answer}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Video Modal */}
        {activeVideo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <button 
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <video 
                src={activeVideo} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}

        {/* Gallery Modal */}
        {activeGallery && activeGallery.gallery && (
          <div className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-[#080808]/95 animate-in fade-in duration-300">
            {/* Main Image View */}
            <div className="relative flex-grow flex items-center justify-center bg-black overflow-hidden group">
              <img 
                src={activeGallery.gallery[galleryIndex]} 
                alt={`${activeGallery.name} View ${galleryIndex + 1}`} 
                className="w-full h-full object-contain transition-transform duration-700"
              />
              
              {/* Technical Overlay */}
              <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20">
                <div className="absolute top-10 left-10 flex flex-col gap-1">
                  <p className="text-[10px] font-mono text-red-500 uppercase tracking-widest bg-black/40 px-2 py-1">System.Active</p>
                  <p className="text-[10px] font-mono text-white opacity-40 uppercase tracking-widest">Orbit_Desk_0X00{galleryIndex + 1}</p>
                </div>
                <div className="absolute bottom-10 right-10 text-right">
                  <div className="h-0.5 w-12 bg-red-600 mb-2 inline-block" />
                  <p className="text-[10px] font-mono text-white opacity-60 uppercase tracking-widest">Hardware Preview Mode</p>
                </div>
              </div>

              {/* Navigation Controls */}
              <button 
                onClick={() => setGalleryIndex(prev => (prev > 0 ? prev - 1 : activeGallery.gallery!.length - 1))}
                className="absolute left-6 p-4 text-white hover:text-red-500 transition-colors bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button 
                onClick={() => setGalleryIndex(prev => (prev < activeGallery.gallery!.length - 1 ? prev + 1 : 0))}
                className="absolute right-6 p-4 text-white hover:text-red-500 transition-colors bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            {/* Sidebar Details */}
            <div className="w-full md:w-[400px] h-full bg-[#111] border-l border-white/10 flex flex-col p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-10">
                <h4 className="text-xl font-black text-white uppercase tracking-tighter">{activeGallery.name}</h4>
                <button 
                  onClick={() => setActiveGallery(null)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-10">
                <p className="text-[10px] font-mono text-red-500 uppercase tracking-widest mb-4">Product Specifications</p>
                <div className="space-y-4">
                  {activeGallery.specs && Object.entries(activeGallery.specs).map(([key, value]) => (
                    <div key={key} className="border-b border-white/5 pb-3">
                      <p className="text-[9px] font-mono text-gray-500 uppercase mb-1">{key}</p>
                      <p className="text-xs text-white font-medium uppercase tracking-wider">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto">
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4">View Gallery</p>
                <div className="grid grid-cols-2 gap-2">
                  {activeGallery.gallery.map((img, idx) => (
                    <button 
                      key={img} 
                      onClick={() => setGalleryIndex(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${galleryIndex === idx ? 'border-red-600' : 'border-transparent opacity-40 hover:opacity-100'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
