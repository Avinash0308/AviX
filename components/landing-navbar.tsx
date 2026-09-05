"use client";

import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Sparkles, ArrowRight, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

const font = Montserrat({ weight: "700", subsets: ["latin"] });

export const LandingNavbar = () => {
  const { isSignedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize or Escape key
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const navLinks = [
    { label: "Capabilities", href: "#capabilities", compact: true },
    { label: "Studio", href: "#preview", compact: true },
    { label: "How It Works", href: "#how-it-works", compact: false },
    { label: "Pricing", href: "#pricing", compact: true },
    { label: "FAQ", href: "#faq", compact: false },
  ];

  return (
    <>
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 pointer-events-none px-3 sm:px-6 pt-3 sm:pt-4">
        <div
          className={cn(
            "w-full flex items-center justify-between pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isScrolled
              ? "max-w-3xl h-12 sm:h-13 py-1.5 sm:py-2 px-3 sm:px-6 rounded-full backdrop-blur-2xl backdrop-saturate-150 bg-white/60 dark:bg-slate-950/60 border border-black/10 dark:border-white/15 shadow-[0_12px_36px_0_rgba(0,0,0,0.1),inset_0_1px_1px_0_rgba(255,255,255,0.7)] dark:shadow-[0_16px_48px_0_rgba(0,0,0,0.6),inset_0_1px_1px_0_rgba(255,255,255,0.15)]"
              : "max-w-6xl mx-auto h-14 sm:h-15 py-2 px-3.5 sm:px-7 rounded-2xl sm:rounded-full backdrop-blur-2xl backdrop-saturate-150 bg-white/55 dark:bg-slate-950/55 border border-black/10 dark:border-white/12 shadow-[0_8px_30px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.6)] dark:shadow-[0_10px_35px_0_rgba(0,0,0,0.45),inset_0_1px_1px_0_rgba(255,255,255,0.12)]"
          )}
        >
          {/* Brand Logo & Links */}
          <div className="flex items-center gap-x-2 shrink-0 min-w-0">
            <Link href="/" className="flex items-center gap-x-2 sm:gap-x-2.5 group shrink-0 whitespace-nowrap">
              <div
                className={cn(
                  "relative rounded-xl overflow-hidden shadow-md shadow-violet-500/20 group-hover:scale-105 transition-all duration-300 shrink-0",
                  isScrolled ? "h-7 w-7" : "h-8 w-8 sm:h-9 sm:w-9"
                )}
              >
                <Image fill alt="Genius.ai Logo" src="/logo.png" className="object-cover" />
              </div>
              <span
                className={cn(
                  "font-bold tracking-tight text-foreground transition-all duration-300 group-hover:text-primary",
                  isScrolled ? "text-sm sm:text-lg" : "text-base sm:text-xl",
                  font.className
                )}
              >
                Genius<span className="text-primary">.ai</span>
              </span>
            </Link>

            <a
              href="https://github.com/Avinash0308"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-[10px] uppercase font-semibold tracking-widest px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-500/40 hover:text-violet-700 dark:hover:text-violet-300 transition-all duration-300 hidden sm:inline-flex items-center gap-1 cursor-pointer shrink-0",
                isScrolled ? "opacity-0 max-w-0 px-0 border-0 overflow-hidden pointer-events-none" : "opacity-100 max-w-[120px]"
              )}
              title="Avinash Agrawal (AviX) on GitHub"
            >
              by AviX
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav
            className={cn(
              "hidden md:flex items-center font-medium text-muted-foreground whitespace-nowrap flex-nowrap shrink-0 transition-all duration-300",
              isScrolled ? "gap-x-5 text-xs" : "gap-x-7 text-sm"
            )}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "hover:text-foreground hover:scale-105 transition-all duration-300 inline-block",
                  !link.compact && isScrolled
                    ? "opacity-0 max-w-0 -mx-1 pointer-events-none overflow-hidden scale-95"
                    : "opacity-100 max-w-[120px]"
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-x-2 sm:gap-x-3 shrink-0 whitespace-nowrap">
            {/* Color Mode Toggle */}
            <div className="shrink-0">
              <ModeToggle />
            </div>

            {/* Desktop / Tablet CTA Buttons */}
            {isSignedIn ? (
              <Link href="/dashboard" className="shrink-0 hidden sm:inline-flex">
                <Button
                  size="sm"
                  className={cn(
                    "rounded-full font-semibold shadow-md shadow-primary/20 group transition-all",
                    isScrolled ? "h-8 px-3.5 text-xs" : "h-9 px-4 text-sm"
                  )}
                >
                  Dashboard
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            ) : (
              <div className="items-center gap-x-2 shrink-0 hidden sm:inline-flex">
                <Link
                  href="/sign-in"
                  className={cn(
                    "transition-all duration-300 inline-block",
                    isScrolled
                      ? "opacity-0 max-w-0 -mr-2 pointer-events-none overflow-hidden"
                      : "opacity-100 max-w-[90px] hidden md:inline-block"
                  )}
                >
                  <Button variant="ghost" size="sm" className="rounded-full font-medium hover:bg-black/5 dark:hover:bg-white/10 px-3">
                    Sign In
                  </Button>
                </Link>
                <Link href="/dashboard" className="shrink-0">
                  <Button
                    size="sm"
                    className={cn(
                      "rounded-full font-semibold bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white shadow-md shadow-purple-500/25 group border-0 transition-all",
                      isScrolled ? "h-8 px-3.5 text-xs" : "h-9 px-4 text-sm"
                    )}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 fill-white/80" />
                    {isScrolled ? "Studio" : "Get Started"}
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button (Toggles menu open / closed) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 hover:bg-white/80 dark:hover:bg-slate-800/80 text-foreground transition-all hover:scale-105 active:scale-95 shrink-0"
              aria-label={mobileMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Card */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed top-[72px] sm:top-[80px] left-3 right-3 sm:left-6 sm:right-6 max-w-md mx-auto rounded-3xl border border-black/10 dark:border-white/15 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl p-5 space-y-4 shadow-2xl shadow-black/25 dark:shadow-black/75 pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200 z-50">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <span className="text-xs opacity-40">→</span>
                </a>
              ))}
              <a
                href="https://github.com/Avinash0308"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 transition flex items-center justify-between"
              >
                <span>AviX GitHub Profile</span>
                <span className="text-xs">↗</span>
              </a>
            </div>

            <div className="pt-3 border-t border-black/10 dark:border-white/10">
              {isSignedIn ? (
                <Link href="/dashboard" className="w-full block" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="lg" className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <Link href="/sign-in" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="lg" className="w-full rounded-2xl font-medium border-black/10 dark:border-white/15">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/dashboard" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="lg" className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold shadow-lg shadow-violet-500/25">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};