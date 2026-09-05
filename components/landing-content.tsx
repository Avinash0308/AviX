"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  MessageSquare,
  Code2,
  ImageIcon,
  Music,
  Video,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Layers,
  History,
  DollarSign,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FluidCtaBanner } from "@/components/fluid-cta-banner";

export const LandingContent = () => {
  const { isSignedIn } = useAuth();
  const [openFaqs, setOpenFaqs] = useState<number[]>([]);

  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const capabilities = [
    {
      title: "Omnimodal Chat",
      subtitle: "Multi-turn conversational intelligence powered by Gemini 2.5 Flash with persistent thread history.",
      icon: MessageSquare,
      color: "text-violet-500",
      bgGradient: "from-violet-500/15 via-purple-500/5 to-transparent",
      badge: "Gemini 2.5",
      stats: "Sub-second response time",
    },
    {
      title: "Code Synthesis",
      subtitle: "Write, review, refactor, and debug production-grade code across 40+ programming languages.",
      icon: Code2,
      color: "text-emerald-500",
      bgGradient: "from-emerald-500/15 via-teal-500/5 to-transparent",
      badge: "Syntax Highlighted",
      stats: "Clean Markdown + 1-Click Copy",
    },
    {
      title: "Flux Image Generation",
      subtitle: "Produce hyper-realistic photos, anime illustrations, digital art, and marketing graphics in crisp fidelity.",
      icon: ImageIcon,
      color: "text-pink-500",
      bgGradient: "from-pink-500/15 via-rose-500/5 to-transparent",
      badge: "Flux Engine",
      stats: "Lossless Instant Downloads",
    },
    {
      title: "Studio Audio & Music",
      subtitle: "Synthesize ambient music tracks, lo-fi beats, podcast intros, and soundscapes from text prompts.",
      icon: Music,
      color: "text-amber-500",
      bgGradient: "from-amber-500/15 via-orange-500/5 to-transparent",
      badge: "Riffusion",
      stats: "Royalty-Free Audio Player",
    },
    {
      title: "Cinematic Video Creation",
      subtitle: "Transform descriptive textual prompts into dynamic video sequences and visual reels using Zeroscope XL.",
      icon: Video,
      color: "text-blue-500",
      bgGradient: "from-blue-500/15 via-cyan-500/5 to-transparent",
      badge: "Zeroscope XL",
      stats: "Rendered in High Definition",
    },
  ];

  const faqs = [
    {
      question: "What is Genius.ai and why do I need it?",
      answer:
        "Genius.ai is an all-in-one generative AI platform that consolidates text conversation, code writing, image art, music synthesis, and video generation into a single unified workspace. Instead of subscribing to 5 separate tools, you get everything under one login with unified history.",
    },
    {
      question: "Do I need to enter a credit card to try it?",
      answer:
        "No credit card is required. You get 5 free generations instantly upon sign up to test any of our AI capabilities. You only upgrade if you love it and need unlimited generations.",
    },
    {
      question: "Can I save my conversations and revisit them?",
      answer:
        "Yes! Genius.ai stores your conversations and generation history securely on your account, so you can create new threads, resume past discussions, and reference your created code or media at any time.",
    },
    {
      question: "Which AI models power the platform?",
      answer:
        "We combine state-of-the-art models from top providers: Google Gemini 2.5 Flash for conversational reasoning and code synthesis, Flux Ghibsky for image generation, Riffusion for audio synthesis, and Zeroscope V2 for text-to-video rendering.",
    },
    {
      question: "Can I use the generated content commercially?",
      answer:
        "Yes, all outputs generated with your account—including code snippets, images, music tracks, and videos—belong to you and can be used for commercial and personal projects.",
    },
    {
      question: "What happens when I upgrade to the Pro plan?",
      answer:
        "Upgrading to Pro unlocks unlimited generations across all 5 AI tools, priority server processing for faster speeds, early access to new AI model updates, and customer support with no credit limits.",
    },
  ];

  const testimonials = [
    {
      name: "Marcus Vance",
      role: "Lead Fullstack Engineer",
      avatar: "MV",
      rating: 5,
      content:
        "Having Gemini for code synthesis and debugging right next to conversation and media generation has completely replaced 3 different tabs in my daily dev workflow.",
    },
    {
      name: "Elena Rostova",
      role: "Creative Art Director",
      avatar: "ER",
      rating: 5,
      content:
        "The Flux image model produces stunning concept art. I generate moodboards, video B-roll ideas, and background soundscapes all within one single subscription.",
    },
    {
      name: "Devon Clark",
      role: "SaaS Founder & Creator",
      avatar: "DC",
      rating: 5,
      content:
        "Genius.ai saved me over $80/month compared to paying for ChatGPT Plus, Midjourney, and Suno separately. The speed and quality are top tier.",
    },
    {
      name: "Aisha Patel",
      role: "Product Growth Specialist",
      avatar: "AP",
      rating: 5,
      content:
        "Super intuitive interface. I use the conversation engine for writing copy, generating social visuals, and crafting podcast intro music in minutes.",
    },
  ];

  return (
    <div className="space-y-28 md:space-y-36 pb-20">
      {/* SECTION 1: WHAT IS GENIUS.AI? (THE CORE VALUE STORY) */}
      <section id="capabilities" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-x-2 px-3 py-1 rounded-full glass-pill text-xs font-semibold text-primary">
            <Layers className="w-3.5 h-3.5" />
            <span>The All-in-One AI Advantage</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight sm:leading-snug">
            <span>Stop Juggling 5 Subscriptions.</span>
            <span className="block mt-2.5 sm:mt-3.5 text-gradient">Everything You Need in One Place.</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground pt-2">
            Most creators and developers waste hours switching between separate chat tools, image generators, code assistants, and audio engines. Genius.ai unifies them into a single, cohesive powerhouse.
          </p>
        </div>

        {/* Bento Grid Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <Link
                key={cap.title}
                href={isSignedIn ? "/dashboard" : "/sign-in"}
                className={cn(
                  "glass-card rounded-2xl p-7 relative overflow-hidden group hover:scale-[1.02] hover:border-primary/40 transition-all duration-300 block cursor-pointer",
                  i === 0 ? "lg:col-span-2 bg-gradient-to-br" : ""
                )}
              >
                {/* Ambient glow on hover */}
                <div
                  className={cn(
                    "absolute -right-12 -top-12 w-40 h-40 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br",
                    cap.bgGradient
                  )}
                />

                <div className="flex items-center justify-between mb-6">
                  <div className={cn("p-3 rounded-xl bg-muted/60 border border-black/5 dark:border-white/10 group-hover:scale-110 transition-transform", cap.color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-muted border border-black/5 dark:border-white/10 text-muted-foreground">
                    {cap.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">{cap.subtitle}</p>

                <div className="pt-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  <span>{cap.stats}</span>
                  <div className="flex items-center gap-1.5 text-primary font-semibold">
                    <span className="text-[11px] opacity-70 group-hover:opacity-100 transition-opacity">Launch</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS (3 SIMPLE STEPS) */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-x-2 px-3 py-1 rounded-full glass-pill text-xs font-semibold text-primary">
            <Zap className="w-3.5 h-3.5" />
            <span>Effortless Creation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            How Genius.ai Works in 3 Steps
          </h2>
          <p className="text-muted-foreground">
            From initial concept to production-ready output in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {[
            {
              step: "01",
              title: "Create Your Account",
              description: "Sign in with Google, GitHub, or email via Clerk in seconds. Receive 5 free credits instantly with zero credit card required.",
              icon: ShieldCheck,
            },
            {
              step: "02",
              title: "Prompt Any Modality",
              description: "Ask a coding question, brainstorm a concept, request an image art prompt, compose audio, or synthesize an HD video clip.",
              icon: Sparkles,
            },
            {
              step: "03",
              title: "Iterate, Save & Export",
              description: "All conversations and outputs are saved to your account history. Copy code, download lossless media, or branch new threads.",
              icon: History,
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="glass-card rounded-2xl p-8 relative flex flex-col justify-between group hover:border-primary/40 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-extrabold font-mono text-primary/30 group-hover:text-primary transition-colors">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: VALUE COMPARISON (5 TOOLS VS GENIUS.AI) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-black/10 dark:border-white/10 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Why an All-in-One Studio Wins
            </h2>
            <p className="text-sm text-muted-foreground">
              Compare the fragmented traditional workflow with Genius.ai:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Old Fragmented Way */}
            <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-4">
              <div className="flex items-center gap-2 text-destructive font-bold">
                <XCircle className="w-5 h-5" />
                <span>The Fragmented 5-Tool Stack</span>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">•</span>
                  <span>5 separate bills totaling <strong>$100+/month</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">•</span>
                  <span>Constantly switching between 5 different browser tabs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">•</span>
                  <span>Scattered history, prompt loss, and separate logins</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">•</span>
                  <span>Inconsistent UI and fragmented user experience</span>
                </li>
              </ul>
            </div>

            {/* The Genius.ai Way */}
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/30 space-y-4 shadow-lg shadow-primary/5">
              <div className="flex items-center gap-2 text-primary font-bold">
                <CheckCircle2 className="w-5 h-5" />
                <span>The Genius.ai Unified Experience</span>
              </div>
              <ul className="space-y-3 text-sm text-foreground/90">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>5 free generations</strong> to start, only $20/mo for Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>One unified workspace for Chat, Code, Images, Audio & Video</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Saved conversation threads and central generation history</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Full dark & light mode with modern fluid micro-animations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Loved by Developers & Creators
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            See what professionals are building with Genius.ai every day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:scale-105 transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed italic">
                  &ldquo;{item.content}&rdquo;
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-black/5 dark:border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-pink-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                  {item.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground leading-none">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: TRANSPARENT PRICING PREVIEW */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <div className="inline-flex items-center gap-x-2 px-3 py-1 rounded-full glass-pill text-xs font-semibold text-primary">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Simple, Transparent Plans
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Start for free. Upgrade whenever you need unlimited scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Tier */}
          <div className="glass-card rounded-3xl p-8 flex flex-col justify-between border border-black/10 dark:border-white/10">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2.5 py-1 rounded-full bg-muted">
                Free Starter
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-foreground">$0</span>
                <span className="text-xs text-muted-foreground">/ free forever</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ideal for testing out all 5 AI models before upgrading.
              </p>
              <ul className="space-y-2.5 text-xs text-foreground/80 pt-4 border-t border-black/5 dark:border-white/10">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 5 Free Generations across all tools
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Full Gemini 2.5 Flash reasoning
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Saved conversation history
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Code syntax highlighting & copy
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
                <Button variant="outline" className="w-full rounded-full font-semibold">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>

          {/* Pro Tier */}
          <div className="glass-card rounded-3xl p-8 flex flex-col justify-between border-2 border-primary shadow-xl shadow-primary/10 relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
            <div className="absolute top-4 right-4">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-md">
                Popular
              </span>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                Pro Unlimited
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-foreground">$20</span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>
              <p className="text-sm text-muted-foreground">
                For creators, developers, and power users who need unconstrained power.
              </p>
              <ul className="space-y-2.5 text-xs text-foreground/90 pt-4 border-t border-black/5 dark:border-white/10">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> <strong>Unlimited Generations</strong> (No limits)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Priority server processing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> All 5 AI engines unlocked
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Full commercial usage rights
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Cancel anytime via Stripe portal
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
                <Button className="w-full rounded-full font-semibold bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25 border-0">
                  <Zap className="w-4 h-4 mr-1.5 fill-white" />
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: INTERACTIVE FAQ ACCORDION (3 ROWS x 2 COLUMNS) */}
      <section id="faq" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-3xl font-extrabold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-muted-foreground">
            Have questions? We have answers.
          </p>
        </div>

        {/* 2 Independent Column Stacks to prevent cross-column shift */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* Left Column Stack */}
          <div className="space-y-4">
            {faqs.slice(0, 3).map((faq, index) => {
              const actualIndex = index;
              const isOpen = openFaqs.includes(actualIndex);
              return (
                <div
                  key={faq.question}
                  className={cn(
                    "glass-card rounded-2xl overflow-hidden transition-all duration-300",
                    isOpen
                      ? "border-primary/40 shadow-xl shadow-primary/5 bg-gradient-to-b from-primary/[0.03] to-transparent ring-1 ring-primary/20"
                      : "border-black/5 dark:border-white/10 hover:border-primary/30"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(actualIndex)}
                    className="w-full px-5 py-4 sm:py-5 text-left flex items-center justify-between group cursor-pointer transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={cn(
                        "font-semibold text-sm sm:text-base transition-colors duration-200 pr-2",
                        isOpen ? "text-primary" : "text-foreground group-hover:text-primary"
                      )}
                    >
                      {faq.question}
                    </span>
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-2 transition-all duration-300",
                        isOpen
                          ? "bg-primary text-white rotate-180 shadow-md shadow-primary/25"
                          : "bg-black/5 dark:bg-white/10 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                      )}
                    >
                      <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                    </div>
                  </button>

                  <div className={cn("accordion-grid", isOpen && "open")}>
                    <div className="accordion-inner">
                      <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-black/5 dark:border-white/5 pt-3">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column Stack */}
          <div className="space-y-4">
            {faqs.slice(3, 6).map((faq, index) => {
              const actualIndex = index + 3;
              const isOpen = openFaqs.includes(actualIndex);
              return (
                <div
                  key={faq.question}
                  className={cn(
                    "glass-card rounded-2xl overflow-hidden transition-all duration-300",
                    isOpen
                      ? "border-primary/40 shadow-xl shadow-primary/5 bg-gradient-to-b from-primary/[0.03] to-transparent ring-1 ring-primary/20"
                      : "border-black/5 dark:border-white/10 hover:border-primary/30"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(actualIndex)}
                    className="w-full px-5 py-4 sm:py-5 text-left flex items-center justify-between group cursor-pointer transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={cn(
                        "font-semibold text-sm sm:text-base transition-colors duration-200 pr-2",
                        isOpen ? "text-primary" : "text-foreground group-hover:text-primary"
                      )}
                    >
                      {faq.question}
                    </span>
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-2 transition-all duration-300",
                        isOpen
                          ? "bg-primary text-white rotate-180 shadow-md shadow-primary/25"
                          : "bg-black/5 dark:bg-white/10 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                      )}
                    >
                      <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                    </div>
                  </button>

                  <div className={cn("accordion-grid", isOpen && "open")}>
                    <div className="accordion-inner">
                      <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-black/5 dark:border-white/5 pt-3">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 7: INTERACTIVE FLUID CTA BANNER */}
      <FluidCtaBanner isSignedIn={!!isSignedIn} />

      {/* SECTION 8: MODERN FOOTER */}
      <footer className="border-t border-black/5 dark:border-white/10 py-8 sm:py-10 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <Link href="/" className="font-bold text-foreground hover:text-primary transition">Genius.ai</Link>
            <span>•</span>
            <span>
              The All-in-One AI Studio by{" "}
              <a
                href="https://github.com/Avinash0308"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                AviX
              </a>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-6 gap-y-2">
            <a href="#capabilities" className="hover:text-foreground transition whitespace-nowrap">Capabilities</a>
            <a href="#preview" className="hover:text-foreground transition whitespace-nowrap">Live Preview</a>
            <a href="#pricing" className="hover:text-foreground transition whitespace-nowrap">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition whitespace-nowrap">FAQ</a>
            <Link href={isSignedIn ? "/dashboard" : "/sign-in"} className="hover:text-foreground transition font-medium whitespace-nowrap">
              Sign In
            </Link>
          </div>

          <p className="text-muted-foreground/80 text-center sm:text-right">
            © {new Date().getFullYear()} Genius.ai. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};