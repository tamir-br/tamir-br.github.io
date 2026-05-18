import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  Mail, 
  Linkedin, 
  ArrowRight, 
  Plus, 
  Save, 
  X, 
  Play,
  Globe,
  Info,
  Upload,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Settings,
  Code2,
  ExternalLink,
  Edit2,
  Dna,
  Bot,
  FlaskConical,
  Zap
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "./lib/utils";

// --- Types ---

interface Profile {
  name: string;
  title: string;
  intro: string;
  description: string;
  avatarUrl: string;
  links: Array<{ label: string; url: string; icon: string }>;
}

interface Stat {
  label: string;
  value: string;
  desc: string;
}

interface Study {
  year: string;
  title: string;
  journal: string;
  details?: string;
}

interface Project {
  id: string;
  title: string;
  name: string;
  tags: string[];
  image: string;
  url: string;
  learnMoreContent?: string;
  websiteUrl?: string;
  videoUrl?: string;
  hoverImage?: string;
  cardDescription?: string;
}

interface PortfolioData {
  profile: Profile;
  stats: Stat[];
  studies: Study[];
  projects: Project[];
  services?: {
    intro: string;
    items: Array<{ icon: string; title: string; desc: string }>;
  };
}

// --- Icons Mapping ---
const IconMap: Record<string, React.ReactNode> = {
  Calendar: <Calendar className="w-4 h-4" />,
  Mail: <Mail className="w-4 h-4" />,
  Linkedin: <Linkedin className="w-4 h-4" />,
  Dna: <Dna className="w-6 h-6 text-brand-primary" />,
  Bot: <Bot className="w-6 h-6 text-brand-primary" />,
  FlaskConical: <FlaskConical className="w-6 h-6 text-brand-primary" />,
  Zap: <Zap className="w-6 h-6 text-brand-primary" />,
};

// --- Components ---

function BrowserHeader() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 border-b border-black/5 bg-gray-50/50">
      <div className="browser-dot bg-[#FF5F57]" />
      <div className="browser-dot bg-[#FEBC2E]" />
      <div className="browser-dot bg-[#28C840]" />
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditButton, setShowEditButton] = useState(false);
  const [editedData, setEditedData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeInfo, setActiveInfo] = useState<Project | null>(null);
  const [showMoreBio, setShowMoreBio] = useState(false);

  useEffect(() => {
    // Hidden edit mode: Type ?edit=true at the end of your URL to see the edit button
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') === 'true' || params.get('admin') === 'true') {
      setShowEditButton(true);
    }

    fetch("data.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setEditedData(json);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load data:", err);
        setIsLoading(false);
      });
  }, []);

  const saveChanges = async () => {
    if (!editedData) return;
    
    // If we're on a static host like GitHub Pages, saving to server won't work
    const isStaticHost = window.location.hostname.includes("github.io") || window.location.hostname.includes("pages.dev");
    
    if (isStaticHost) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(editedData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", "data.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      alert("Note: GitHub Pages is a static host and cannot save files directly. \n\nI've downloaded the updated 'data.json' for you. \n1. Go to your GitHub repo.\n2. Upload this file into the 'public/' folder.\n3. Push the changes.");
      setData(editedData);
      setIsEditing(false);
      return;
    }

    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to save: ${res.status} - ${text.substring(0, 100)}`);
      }
      const json = await res.json();
      setData(editedData);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving data:", err);
      alert("Save failed. Please check your connection and try again.");
    }
  };

  // --- Helpers ---
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "about:blank";
    
    let videoId = "";
    if (url.includes("v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    } else if (url.includes("/embed/")) {
      videoId = url.split("/embed/")[1].split("?")[0];
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url;
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-surface font-mono text-sm uppercase tracking-widest animate-pulse">
        Initializing Workspace...
      </div>
    );
  }

  const displayedProjects = showAllProjects ? data.projects : data.projects.slice(0, 6);

  return (
    <div className="min-h-screen bg-brand-surface text-brand-ink selection:bg-brand-primary selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-brand-surface/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-mono text-xs font-bold tracking-tighter uppercase flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-primary rounded-full" />
            {data.profile.name}
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-1 font-mono text-[12px] uppercase tracking-wider text-brand-muted">
              <a href="#about" className="px-3 py-2 rounded-full hover:bg-black/5 hover:text-brand-ink transition-all active:scale-95">About</a>
              <a href="#studies" className="px-3 py-2 rounded-full hover:bg-black/5 hover:text-brand-ink transition-all active:scale-95">Research</a>
              <a href="#projects" className="px-3 py-2 rounded-full hover:bg-black/5 hover:text-brand-ink transition-all active:scale-95">Projects</a>
              <a href="#consulting" className="px-3 py-2 rounded-full hover:bg-black/5 hover:text-brand-ink transition-all active:scale-95">Consulting</a>
            </div>
            {showEditButton && (
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 hover:bg-black/5 rounded-full transition-colors"
                title="Toggle Edit Mode"
              >
                <Settings className={cn("w-4 h-4 transition-transform", isEditing && "rotate-90 text-brand-primary")} />
              </button>
            )}
            <a 
              href={data.profile.links.find(l => l.label.toLowerCase().includes('call'))?.url || "#"} 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-primary text-white px-5 py-2 rounded-full text-[13px] font-medium hover:bg-opacity-90 transition-all flex items-center gap-2"
            >
              Book a call
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section (omitted unchanged parts for brevity in turn, but keeping structure for edit_file) */}
      <section id="about" className="pt-24 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-20 items-start">
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full"
              >
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
                <span className="font-mono text-[11px] uppercase font-bold tracking-wider">Open for roles & consulting</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-7xl font-bold tracking-tight leading-[0.95]"
              >
                {data.profile.name.split(',')[0]}<br />
                <span className="text-brand-muted">{data.profile.name.split(',')[1]}</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-medium text-brand-muted max-w-xl"
              >
                {data.profile.title}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="prose prose-brand-brand prose-p:text-lg prose-p:leading-relaxed text-brand-muted max-w-2xl"
              >
                <ReactMarkdown>{data.profile.description}</ReactMarkdown>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4 pt-4"
              >
                {data.profile.links.map((link) => (
                  <a 
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-md font-medium text-base hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand-primary/20"
                  >
                    {IconMap[link.icon]}
                    {link.label}
                  </a>
                ))}
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative aspect-square"
            >
              <div className="absolute inset-0 rounded-full border border-black/5 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-dashed border-brand-primary/20" />
              <img 
                src={data.profile.avatarUrl ? data.profile.avatarUrl : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"}
                alt={data.profile.name}
                className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-700 object-top"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-10 right-10 flex items-center gap-2 p-3 bg-white border border-black/10 rounded-xl shadow-xl backdrop-blur-xl">
                 <span className="w-3 h-3 bg-green-500 rounded-full" />
                 <span className="font-mono text-[12px] uppercase font-bold text-brand-muted">Active now</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Divider */}
      <section className="py-20 border-y border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-6 overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 font-mono text-[12px] uppercase tracking-widest text-brand-muted opacity-50 mb-12">
            <span>Core Metrics</span>
            <div className="flex bg-brand-primary h-px flex-1 mx-8" />
            <span>Commercial Impact</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12">
            {data.stats.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="space-y-2 group"
              >
                <div className="text-sm font-bold text-brand-primary tracking-widest uppercase">{stat.label}</div>
                <div className="text-3xl md:text-2xl lg:text-4xl font-bold tracking-tighter group-hover:text-brand-primary transition-colors truncate">
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Selected Studies */}
      <section id="studies" className="py-32 px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="space-y-4">
            <span className="font-mono text-sm uppercase tracking-widest text-brand-primary font-bold">Research</span>
            <h2 className="text-4xl font-bold tracking-tight">Selected Studies</h2>
          </div>

          <div className="space-y-4">
            {data.studies.map((study, i) => (
              <motion.div 
                key={study.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 bg-white border border-black/10 rounded-sm hover:border-brand-primary transition-all flex flex-col md:flex-row gap-8 items-start"
              >
                <div className="font-mono text-base font-bold text-brand-muted pt-1">{study.year}</div>
                <div className="flex-1 space-y-3">
                   <h3 className="text-2xl font-semibold leading-snug group-hover:text-brand-primary transition-colors">
                     {study.title}
                   </h3>
                   <div className="flex items-center gap-3">
                     <span className="text-base italic text-brand-muted">{study.journal}</span>
                     {study.details && <span className="text-sm text-brand-muted opacity-60">• {study.details}</span>}
                   </div>
                </div>
                <a href={data.profile.links.find(l => l.label.toLowerCase().includes('pubmed'))?.url || "https://pubmed.ncbi.nlm.nih.gov/?sort=date&term=Biezuner%20T&cauthor_id=23897237"} className="p-3 bg-brand-surface rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                   <ArrowRight className="w-5 h-5" />
                </a>
              </motion.div>
            ))}
          </div>
          
          <div className="space-y-6 pt-4">
            <p className="text-lg text-brand-muted leading-relaxed">
              20 years of lab experience, 16 years in Next Generation Sequencing (NGS) field.
              {" "}
              {!showMoreBio && (
                <button 
                  onClick={() => setShowMoreBio(true)}
                  className="text-brand-primary font-bold hover:underline"
                >
                  Read more
                </button>
              )}
            </p>
            
            <AnimatePresence>
              {showMoreBio && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-brand-surface p-8 rounded-2xl border border-black/5 space-y-6 relative">
                    <button 
                      onClick={() => setShowMoreBio(false)}
                      className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-lg text-brand-muted leading-relaxed">
                      20 years of lab experience, 16 years in Next Generation Sequencing realm, I harness biotechnologies to push scientific discoveries and the diagnostic field forward. Expert in single cell, genomics, and synthetic biology I spent years of study at the Weizmann Institute pushing what sequencing could reveal - from reading the human cell lineage tree at single-cell resolution to detecting cancer mutations. That's the science that made Sequentify possible, and it's what keeps me drawn to the hard problems.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center pt-4">
            <a 
              href="https://pubmed.ncbi.nlm.nih.gov/?sort=date&term=Biezuner%20T&cauthor_id=23897237" 
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase font-bold tracking-widest border-b border-brand-primary pb-1 hover:text-brand-primary transition-colors"
            >
               View All on PubMed
            </a>
          </div>
        </div>
      </section>

      {/* Featured AI Projects */}
      <section id="projects" className="py-32 px-6 bg-brand-surface">
        <div className="max-w-7xl mx-auto space-y-16">
           <div className="space-y-4">
            <span className="font-mono text-sm uppercase tracking-widest text-brand-primary font-bold">Showcase</span>
            <h2 className="text-4xl font-bold tracking-tight">Featured AI Projects</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedProjects.map((project, i) => (
               <motion.div 
                 key={project.id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 transition={{ delay: i * 0.05 }}
                 viewport={{ once: true }}
                 className="browser-window group hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-500 overflow-hidden"
               >
                 <BrowserHeader />
                 <div className="relative">
                   <div className="relative aspect-[4/5] overflow-hidden bg-brand-surface flex items-center justify-center p-6">
                     <img 
                       src={project.image || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400"}
                        alt={project.name}
                       className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                       referrerPolicy="no-referrer"
                     />
                     {/* Hover Overlay */}
                     <div className="absolute inset-0 bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {/* Hover Background Image - Fitted */}
                        <img 
                          src={project.hoverImage || project.image || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400"}
                          className="absolute inset-0 w-full h-full object-contain p-4 opacity-70 scale-110 group-hover:scale-100 transition-transform duration-700"
                          alt=""
                        />
                        <div className="absolute inset-0 bg-brand-primary/45 flex flex-col items-center justify-center p-4 text-center text-white overflow-y-auto">
                           <div className="shrink-0 font-mono text-[11px] tracking-widest uppercase mb-3 py-1 px-2 border border-white/20">Project Access</div>
                           <h4 className="shrink-0 text-lg font-bold mb-4 italic leading-tight">"{project.title}"</h4>
                           <div className="flex flex-col gap-2 w-full max-w-[180px]">
                             {project.learnMoreContent && (
                               <button 
                                 onClick={() => setActiveInfo(project)}
                                 className="bg-white text-brand-primary px-4 py-2 rounded text-[11px] font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2"
                               >
                                 <Info className="w-3 h-3" />
                                 Learn More
                               </button>
                             )}
                             {project.websiteUrl && (
                               <a 
                                 href={project.websiteUrl}
                                 target="_blank"
                                 className="border border-white/40 px-4 py-2 rounded text-[11px] font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                               >
                                 <Globe className="w-3 h-3" />
                                 Visit Website
                               </a>
                             )}
                             {project.videoUrl && (
                               <button 
                                 onClick={() => setActiveVideo(project.videoUrl!)}
                                 className="border border-white/40 px-4 py-2 rounded text-[11px] font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                               >
                                 <Play className="w-3 h-3" />
                                 Watch Video
                               </button>
                             )}
                              {!project.learnMoreContent && !project.websiteUrl && !project.videoUrl && project.url && project.url !== "#" && (
                                <a 
                                  href={project.url}
                                  target="_blank"
                                  className="bg-white text-brand-primary px-4 py-2 rounded text-[11px] font-bold hover:scale-105 transition-transform"
                                >
                                  Explore Case
                                </a>
                              )}
                           </div>
                        </div>
                     </div>
                   </div>
                   
                   <div className="p-8 space-y-4 bg-white">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-mono text-[12px] font-bold text-brand-primary uppercase">
                           <Code2 className="w-3 h-3" />
                           {project.name}
                        </div>
                        <ExternalLink className="w-3 h-3 text-brand-muted opacity-30 group-hover:opacity-100 transition-opacity" />
                     </div>
                     <h3 className="text-2xl font-bold tracking-tight line-clamp-2 min-h-[3.5rem]">
                       {project.cardDescription || (project.title.includes('.') ? project.title.split('.')[0] + '.' : project.title)}
                     </h3>
                     <div className="flex flex-wrap gap-2">
                       {project.tags.map(tag => (
                         <span key={tag} className="px-2 py-0.5 border border-black/5 text-[10px] font-mono font-bold uppercase tracking-wider text-brand-muted">
                           {tag}
                         </span>
                       ))}
                     </div>
                   </div>
                 </div>
               </motion.div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-6 pt-12">
            {data.projects.length > 6 && (
              <button 
                onClick={() => setShowAllProjects(!showAllProjects)}
                className="group flex items-center gap-4 px-10 py-4 bg-white border border-black/5 rounded-full font-mono text-sm font-bold uppercase tracking-widest shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                {showAllProjects ? "Show Featured Only" : `Show All projects (${data.projects.length})`}
                <ArrowRight className={cn("w-4 h-4 text-brand-primary transition-transform", showAllProjects ? "-rotate-90" : "group-hover:translate-x-1")} />
              </button>
            )}

             <div className={cn("flex flex-col items-center gap-4", data.projects.length > 6 ? "pt-8" : "pt-4")}>
                <a 
                  href={data.profile.links.find(l => l.label.toLowerCase().includes('call'))?.url || "#"} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-8 py-3 bg-brand-primary text-white font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 text-xs uppercase tracking-widest"
                >
                  <Calendar className="w-4 h-4" />
                  Book a project call
                </a>
              </div>
          </div>
        </div>
      </section>

      {/* Consulting Section */}
      {data.services && (
        <section id="consulting" className="py-32 px-6 border-t border-black/5 bg-white">
          <div className="max-w-7xl mx-auto space-y-16 text-center md:text-left">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
              <div className="space-y-4">
                <span className="font-mono text-sm uppercase tracking-widest text-brand-primary font-bold">Consulting</span>
                <h2 className="text-4xl font-bold tracking-tight">Open for consulting and project-based work.</h2>
              </div>
              <p className="text-lg text-brand-muted leading-relaxed max-w-xl">
                {data.services.intro}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.services.items.map((svc, i) => (
                <motion.div 
                  key={svc.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-8 bg-brand-surface border border-black/5 rounded-2xl space-y-6 hover:shadow-xl hover:-translate-y-1 transition-all group text-left"
                >
                  <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    {IconMap[svc.icon] || <span className="text-2xl">{svc.icon}</span>}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-xl">{svc.title}</h3>
                    <p className="text-base text-brand-muted leading-relaxed">
                      {svc.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-32 px-6 border-t border-black/5 bg-white text-center space-y-12">
        <div className="space-y-4">
           <span className="font-mono text-sm uppercase tracking-widest text-brand-primary font-bold">Contact</span>
           <h3 className="text-4xl font-bold tracking-tight">Let's work together.</h3>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
           <a 
             href={data.profile.links.find(l => l.label.toLowerCase().includes('call'))?.url || "#"} 
             target="_blank"
             rel="noopener noreferrer"
             className="flex items-center gap-3 px-8 py-4 bg-brand-primary text-white font-bold rounded-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20"
           >
             <Calendar className="w-5 h-5" />
             Book a call
           </a>
           <a 
             href={data.profile.links.find(l => l.icon === 'Mail')?.url || 'mailto:tamir.devlab@gmail.com'} 
             className="flex items-center gap-3 px-8 py-4 border border-black/10 font-bold rounded-lg hover:bg-black/5 active:scale-95 transition-all"
           >
             <Mail className="w-5 h-5 text-brand-primary" />
             {data.profile.links.find(l => l.icon === 'Mail')?.url?.replace('mailto:', '') || 'tamir.devlab@gmail.com'}
           </a>
        </div>
        <div className="pt-24 font-mono text-[12px] text-brand-muted uppercase tracking-[0.3em] opacity-40">
           Tamir Biezuner, PhD — Modiin, Israel — 2026
        </div>
      </footer>

      {/* --- Video Modal --- */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-brand-ink/95 backdrop-blur-xl" onClick={() => setActiveVideo(null)} />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setActiveVideo(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <iframe 
                src={getYouTubeEmbedUrl(activeVideo)} 
                className="w-full h-full" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen 
                title="Video Content"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Learn More Modal --- */}
      <AnimatePresence>
        {activeInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-brand-ink/90 backdrop-blur-md" onClick={() => setActiveInfo(null)} />
            <motion.div 
               initial={{ x: 100, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-black/5 bg-brand-surface flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-mono text-[12px] font-bold text-brand-primary uppercase tracking-widest">{activeInfo.name}</div>
                  <h3 className="text-xl font-bold">{activeInfo.title}</h3>
                </div>
                <button 
                  onClick={() => setActiveInfo(null)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-12">
                 <div className="prose prose-brand max-w-none prose-p:text-lg prose-p:leading-relaxed">
                   <ReactMarkdown>{activeInfo.learnMoreContent || ""}</ReactMarkdown>
                 </div>
              </div>
              <div className="p-6 bg-brand-surface border-t border-black/5 flex justify-end">
                <button 
                  onClick={() => setActiveInfo(null)}
                  className="px-6 py-2 bg-brand-primary text-white text-xs font-bold rounded-lg"
                >
                  Close Exploration
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CMS Modal --- */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-brand-ink/90 backdrop-blur-md" onClick={() => setIsEditing(false)} />
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative w-full max-w-5xl h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                  <Edit2 className="w-4 h-4 text-brand-primary" />
                  <h2 className="font-mono text-xs font-bold uppercase tracking-widest">Workspace Editor</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="p-2 hover:bg-black/5 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={saveChanges}
                    className="flex items-center gap-2 bg-brand-primary text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Deploy Changes
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-brand-surface/30">
                <div className="max-w-4xl mx-auto space-y-12">
                   {/* Profile Editor */}
                   <div className="space-y-6">
                      <h3 className="font-mono text-[10px] font-bold text-brand-muted uppercase pb-2 border-b border-black/5">1. Profile Identification</h3>
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-mono uppercase text-brand-muted">Name</label>
                              <input 
                                value={editedData?.profile.name} 
                                onChange={e => setEditedData({...editedData!, profile: {...editedData!.profile, name: e.target.value}})}
                                className="w-full bg-white border border-black/10 px-4 py-3 rounded text-sm outline-none focus:border-brand-primary"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-mono uppercase text-brand-muted">Title</label>
                              <input 
                                value={editedData?.profile.title} 
                                onChange={e => setEditedData({...editedData!, profile: {...editedData!.profile, title: e.target.value}})}
                                className="w-full bg-white border border-black/10 px-4 py-3 rounded text-sm outline-none focus:border-brand-primary"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono uppercase text-brand-muted">Biography (Markdown)</label>
                            <textarea 
                              rows={6}
                              value={editedData?.profile.description} 
                              onChange={e => setEditedData({...editedData!, profile: {...editedData!.profile, description: e.target.value}})}
                              className="w-full bg-white border border-black/10 px-4 py-3 rounded text-sm outline-none focus:border-brand-primary font-mono text-xs"
                            />
                          </div>
                        </div>
                        <div className="w-48 space-y-4">
                           <label className="text-[10px] font-mono uppercase text-brand-muted">Hero Image</label>
                           <div className="relative aspect-square rounded-xl overflow-hidden bg-brand-surface border border-dashed border-black/20 group">
                              <img 
                                src={editedData.profile.avatarUrl ? editedData.profile.avatarUrl : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"} 
                                alt="Profile" 
                                className="w-full h-full object-contain object-top"
                              />
                              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                 <div className="text-white flex flex-col items-center gap-2">
                                    <Upload className="w-6 h-6" />
                                    <span className="text-[10px] font-mono uppercase font-bold">Swap Image</span>
                                 </div>
                                 <input 
                                   type="file" 
                                   className="hidden" 
                                   accept="image/*"
                                   onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;

                                      if (window.location.hostname.includes("github.io") || window.location.hostname.includes("pages.dev")) {
                                        const manualPath = prompt("GitHub Pages is static. To add an image:\n1. Upload your file to 'public/uploads/' on GitHub.\n2. Enter the path here (e.g., uploads/my-image.jpg):", "uploads/" + file.name);
                                        if (manualPath) {
                                          setEditedData({...editedData!, profile: {...editedData!.profile, avatarUrl: manualPath}});
                                        }
                                        return;
                                      }

                                      try {
                                        const formData = new FormData();
                                        formData.append("image", file);
                                        const res = await fetch("/api/upload", {
                                          method: "POST",
                                          body: formData
                                        });
                                        if (!res.ok) throw new Error("Upload failed");
                                        const json = await res.json();
                                        if (json.imageUrl) {
                                          setEditedData({...editedData!, profile: {...editedData!.profile, avatarUrl: json.imageUrl}});
                                        }
                                      } catch (err) {
                                        console.error(err);
                                        alert("Image upload failed. Please try a smaller image or check your connection.");
                                      }
                                   }}
                                 />
                              </label>
                           </div>
                           <div className="space-y-1">
                             <label className="text-[9px] font-mono uppercase text-brand-muted">Path Access</label>
                             <input 
                               value={editedData.profile.avatarUrl}
                               onChange={e => setEditedData({...editedData!, profile: {...editedData!.profile, avatarUrl: e.target.value}})}
                               className="w-full bg-white border border-black/10 px-2 py-1 rounded text-[10px] outline-none focus:border-brand-primary font-mono"
                               placeholder="uploads/filename.jpg"
                             />
                           </div>
                           <p className="text-[9px] font-mono text-brand-muted leading-tight">Recommended: Square, high-res portrait.</p>
                        </div>
                      </div>
                   </div>

                   {/* Projects Editor */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-black/5 pb-2">
                        <h3 className="font-mono text-[10px] font-bold text-brand-muted uppercase">2. Project Index</h3>
                        <button 
                          onClick={() => {
                            const newProj = {
                              id: Math.random().toString(),
                              title: "New Project",
                              name: "PROJECT_NAME",
                              tags: [],
                              image: "",
                              url: "#"
                            };
                            setEditedData({...editedData!, projects: [...editedData!.projects, newProj]});
                          }}
                          className="flex items-center gap-1.5 text-brand-primary font-mono text-[10px] uppercase font-bold"
                        >
                          <Plus className="w-3 h-3" />
                          Append Entry
                        </button>
                      </div>
                      <div className="space-y-4">
                        {editedData?.projects.map((project, idx) => (
                          <div key={project.id} className="p-6 bg-white border border-black/5 rounded-lg space-y-4 relative group">
                            <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {idx > 0 && (
                                <button 
                                  onClick={() => {
                                    const newProjs = [...editedData.projects];
                                    [newProjs[idx - 1], newProjs[idx]] = [newProjs[idx], newProjs[idx - 1]];
                                    setEditedData({...editedData, projects: newProjs});
                                  }}
                                  className="p-1 hover:bg-brand-surface rounded text-brand-muted"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                              )}
                              {idx < editedData.projects.length - 1 && (
                                <button 
                                  onClick={() => {
                                    const newProjs = [...editedData.projects];
                                    [newProjs[idx + 1], newProjs[idx]] = [newProjs[idx], newProjs[idx + 1]];
                                    setEditedData({...editedData, projects: newProjs});
                                  }}
                                  className="p-1 hover:bg-brand-surface rounded text-brand-muted"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  const newProjs = editedData.projects.filter((_, i) => i !== idx);
                                  setEditedData({...editedData, projects: newProjs});
                                }}
                                className="p-1 hover:bg-red-50 text-red-500 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                               <div className="w-6 h-6 rounded-full bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center font-mono">
                                 {idx + 1}
                               </div>
                               <span className="text-[10px] font-mono uppercase text-brand-muted font-bold">Position Order</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-1">
                                 <label className="text-[9px] font-mono uppercase text-brand-muted">Short Name</label>
                                 <input 
                                   placeholder="Project Name"
                                   value={project.name} 
                                   onChange={e => {
                                     const newProjs = [...editedData.projects];
                                     newProjs[idx].name = e.target.value;
                                     setEditedData({...editedData, projects: newProjs});
                                   }}
                                   className="w-full bg-brand-surface/50 border-none px-3 py-2 rounded text-xs font-mono"
                                 />
                               </div>
                               <div className="space-y-1">
                                 <label className="text-[9px] font-mono uppercase text-brand-muted">Legacy URL (Fallback)</label>
                                 <input 
                                   placeholder="URL"
                                   value={project.url} 
                                   onChange={e => {
                                     const newProjs = [...editedData.projects];
                                     newProjs[idx].url = e.target.value;
                                     setEditedData({...editedData, projects: newProjs});
                                   }}
                                   className="w-full bg-brand-surface/50 border-none px-3 py-2 rounded text-xs font-mono"
                                 />
                               </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono uppercase text-brand-muted">Display Title</label>
                              <input 
                                 placeholder="Project Full Title"
                                 value={project.title} 
                                 onChange={e => {
                                   const newProjs = [...editedData.projects];
                                   newProjs[idx].title = e.target.value;
                                   setEditedData({...editedData, projects: newProjs});
                                 }}
                                 className="w-full bg-brand-surface/50 border-none px-3 py-2 rounded text-sm font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono uppercase text-brand-muted">Card Description (Bottom Text)</label>
                              <textarea 
                                 placeholder="If empty, takes first sentence of title."
                                 value={project.cardDescription || ""} 
                                 onChange={e => {
                                   const newProjs = [...editedData.projects];
                                   newProjs[idx].cardDescription = e.target.value;
                                   setEditedData({...editedData, projects: newProjs});
                                 }}
                                 className="w-full bg-brand-surface/50 border-none px-3 py-2 rounded text-xs font-mono h-16"
                              />
                            </div>

                             <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                 <label className="text-[9px] font-mono uppercase text-brand-muted">Main Image</label>
                                 <div className="flex items-center gap-2">
                                   <input 
                                     placeholder="Image URL"
                                     value={project.image} 
                                     onChange={e => {
                                       const newProjs = [...editedData.projects];
                                       newProjs[idx].image = e.target.value;
                                       setEditedData({...editedData, projects: newProjs});
                                     }}
                                     className="flex-1 bg-brand-surface/50 border-none px-3 py-2 rounded text-[10px] font-mono"
                                   />
                                   <label className="cursor-pointer bg-brand-primary/10 text-brand-primary p-2 rounded hover:bg-brand-primary/20 transition-colors">
                                     <Upload className="w-4 h-4" />
                                     <input 
                                       type="file" 
                                       className="hidden" 
                                       accept="image/*"
                                       onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;

                                          if (window.location.hostname.includes("github.io") || window.location.hostname.includes("pages.dev")) {
                                            const manualPath = prompt("GitHub Pages is static. To add an image:\n1. Upload your file to 'public/uploads/' on GitHub.\n2. Enter the path here (e.g., uploads/my-image.jpg):", "uploads/" + file.name);
                                            if (manualPath) {
                                              const newProjs = [...editedData.projects];
                                              newProjs[idx].image = manualPath;
                                              setEditedData({...editedData, projects: newProjs});
                                            }
                                            return;
                                          }

                                          try {
                                            const formData = new FormData();
                                            formData.append("image", file);
                                            const res = await fetch("/api/upload", {
                                              method: "POST",
                                              body: formData
                                            });
                                            if (!res.ok) throw new Error("Upload failed");
                                            const json = await res.json();
                                            if (json.imageUrl) {
                                              const newProjs = [...editedData.projects];
                                              newProjs[idx].image = json.imageUrl;
                                              setEditedData({...editedData, projects: newProjs});
                                            }
                                          } catch (err) {
                                            console.error(err);
                                            alert("Image upload failed.");
                                          }
                                       }}
                                     />
                                   </label>
                                 </div>
                               </div>
                               <div className="space-y-2">
                                 <label className="text-[9px] font-mono uppercase text-brand-muted">Hover Background Image</label>
                                 <div className="flex items-center gap-2">
                                   <input 
                                     placeholder="Hover Image URL (Optional)"
                                     value={project.hoverImage || ""} 
                                     onChange={e => {
                                       const newProjs = [...editedData.projects];
                                       newProjs[idx].hoverImage = e.target.value;
                                       setEditedData({...editedData, projects: newProjs});
                                     }}
                                     className="flex-1 bg-brand-surface/50 border-none px-3 py-2 rounded text-[10px] font-mono"
                                   />
                                   <label className="cursor-pointer bg-brand-primary/10 text-brand-primary p-2 rounded hover:bg-brand-primary/20 transition-colors">
                                     <Upload className="w-4 h-4" />
                                     <input 
                                       type="file" 
                                       className="hidden" 
                                       accept="image/*"
                                       onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;

                                          if (window.location.hostname.includes("github.io") || window.location.hostname.includes("pages.dev")) {
                                            const manualPath = prompt("GitHub Pages is static. To add an image:\n1. Upload your file to 'public/uploads/' on GitHub.\n2. Enter the path here (e.g., uploads/my-image.jpg):", "uploads/" + file.name);
                                            if (manualPath) {
                                              const newProjs = [...editedData.projects];
                                              newProjs[idx].hoverImage = manualPath;
                                              setEditedData({...editedData, projects: newProjs});
                                            }
                                            return;
                                          }

                                          try {
                                            const formData = new FormData();
                                            formData.append("image", file);
                                            const res = await fetch("/api/upload", {
                                              method: "POST",
                                              body: formData
                                            });
                                            if (!res.ok) throw new Error("Upload failed");
                                            const json = await res.json();
                                            if (json.imageUrl) {
                                              const newProjs = [...editedData.projects];
                                              newProjs[idx].hoverImage = json.imageUrl;
                                              setEditedData({...editedData, projects: newProjs});
                                            }
                                          } catch (err) {
                                            console.error(err);
                                            alert("Image upload failed.");
                                          }
                                       }}
                                     />
                                   </label>
                                 </div>
                               </div>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono uppercase text-brand-muted">Website URL</label>
                                  <input 
                                    placeholder="https://..."
                                    value={project.websiteUrl || ""} 
                                    onChange={e => {
                                      const newProjs = [...editedData.projects];
                                      newProjs[idx].websiteUrl = e.target.value;
                                      setEditedData({...editedData, projects: newProjs});
                                    }}
                                    className="w-full bg-brand-surface/50 border-none px-3 py-2 rounded text-[10px] font-mono"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono uppercase text-brand-muted">YouTube Video URL</label>
                                  <input 
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={project.videoUrl || ""} 
                                    onChange={e => {
                                      const newProjs = [...editedData.projects];
                                      newProjs[idx].videoUrl = e.target.value;
                                      setEditedData({...editedData, projects: newProjs});
                                    }}
                                    className="w-full bg-brand-surface/50 border-none px-3 py-2 rounded text-[10px] font-mono"
                                  />
                                </div>
                             </div>

                             <div className="space-y-1">
                                <label className="text-[9px] font-mono uppercase text-brand-muted">Learn More Content (Markdown)</label>
                                <textarea 
                                  placeholder="Detailed project description..."
                                  value={project.learnMoreContent || ""} 
                                  onChange={e => {
                                    const newProjs = [...editedData.projects];
                                    newProjs[idx].learnMoreContent = e.target.value;
                                    setEditedData({...editedData, projects: newProjs});
                                  }}
                                  className="w-full bg-brand-surface/50 border-none px-3 py-2 rounded text-[10px] font-mono h-24"
                                />
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   <p className="font-mono text-[9px] text-center text-brand-muted opacity-50 uppercase tracking-widest pb-12">
                     Warning: Deploying changes will overwrite data.json on the server.
                   </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

