"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FluidCtaBannerProps {
  isSignedIn: boolean;
}

interface VoidNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  strength: number;
  life: number;
  wobbleOffset: number;
}

interface SplashDroplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

export const FluidCtaBanner = ({ isSignedIn }: FluidCtaBannerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme === "dark";
  const isDarkRef = useRef(isDark);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    const voidNodes: VoidNode[] = [];
    const droplets: SplashDroplet[] = [];

    let mouse = {
      x: -1000,
      y: -1000,
      lastX: -1000,
      lastY: -1000,
      vx: 0,
      vy: 0,
      active: false,
    };

    const handleResize = () => {
      if (!container || !canvas) return;
      width = canvas.width = container.clientWidth;
      height = canvas.height = container.clientHeight;
    };

    const addVoidPoint = (x: number, y: number, vx: number, vy: number) => {
      const speed = Math.hypot(vx, vy);
      const targetRadius = Math.min(80, Math.max(45, 40 + speed * 1.5));

      voidNodes.push({
        x,
        y,
        vx: vx * 0.12,
        vy: vy * 0.12,
        radius: targetRadius * 0.4,
        maxRadius: targetRadius,
        strength: 1.0,
        life: 1.0,
        wobbleOffset: Math.random() * Math.PI * 2,
      });

      if (voidNodes.length > 35) {
        voidNodes.shift();
      }

      // Droplets adaptive to theme
      if (speed > 4 && Math.random() > 0.45) {
        const angle = Math.atan2(vy, vx) + (Math.random() - 0.5) * 1.6;
        const dropSpeed = Math.random() * 2.5 + 1.5;
        const dark = isDarkRef.current;
        droplets.push({
          x: x + (Math.random() - 0.5) * 15,
          y: y + (Math.random() - 0.5) * 15,
          vx: Math.cos(angle) * dropSpeed,
          vy: Math.sin(angle) * dropSpeed,
          radius: Math.random() * 2 + 1.2,
          alpha: 0.6,
          color: dark
            ? Math.random() > 0.5
              ? "rgba(167, 139, 250, 0.7)"
              : "rgba(129, 140, 248, 0.6)"
            : Math.random() > 0.5
            ? "rgba(124, 58, 237, 0.45)"
            : "rgba(217, 70, 239, 0.4)",
        });
        if (droplets.length > 25) droplets.shift();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      if (mouse.lastX === -1000) {
        mouse.lastX = currentX;
        mouse.lastY = currentY;
      }

      mouse.vx = currentX - mouse.lastX;
      mouse.vy = currentY - mouse.lastY;
      mouse.x = currentX;
      mouse.y = currentY;
      mouse.lastX = currentX;
      mouse.lastY = currentY;
      mouse.active = true;

      addVoidPoint(currentX, currentY, mouse.vx, mouse.vy);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      mouse.lastX = currentX;
      mouse.lastY = currentY;
      mouse.x = currentX;
      mouse.y = currentY;
      mouse.active = true;
      addVoidPoint(currentX, currentY, 0, 0);
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.lastX = -1000;
      mouse.lastY = -1000;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    let frameCount = 0;

    const render = () => {
      frameCount += 1;
      const dark = isDarkRef.current;

      ctx.clearRect(0, 0, width, height);

      if (dark) {
        // DARK THEME CANVAS
        // 1. Crystal-clear dark glass base
        const glassBase = ctx.createLinearGradient(0, 0, 0, height);
        glassBase.addColorStop(0, "rgba(15, 23, 42, 0.45)");
        glassBase.addColorStop(1, "rgba(2, 6, 23, 0.6)");
        ctx.fillStyle = glassBase;
        ctx.fillRect(0, 0, width, height);

        // 2. Translucent Frosted Aurora Fluid
        ctx.save();
        const fluidGrad = ctx.createLinearGradient(0, 0, width, height);
        fluidGrad.addColorStop(0, "rgba(79, 70, 229, 0.22)"); // Soft Indigo
        fluidGrad.addColorStop(0.35, "rgba(124, 58, 237, 0.3)"); // Translucent Violet
        fluidGrad.addColorStop(0.7, "rgba(168, 85, 247, 0.26)"); // Gentle Purple Aurora
        fluidGrad.addColorStop(1, "rgba(236, 72, 153, 0.18)"); // Subtle Rose Shimmer

        ctx.fillStyle = fluidGrad;
        ctx.fillRect(0, 0, width, height);
      } else {
        // LIGHT THEME CANVAS
        // 1. Crisp frosted white glass base
        const glassBase = ctx.createLinearGradient(0, 0, 0, height);
        glassBase.addColorStop(0, "rgba(255, 255, 255, 0.88)");
        glassBase.addColorStop(1, "rgba(248, 250, 252, 0.92)");
        ctx.fillStyle = glassBase;
        ctx.fillRect(0, 0, width, height);

        // 2. Translucent Pastel Aurora Fluid (Light, airy, crisp)
        ctx.save();
        const fluidGrad = ctx.createLinearGradient(0, 0, width, height);
        fluidGrad.addColorStop(0, "rgba(167, 139, 250, 0.22)"); // Soft lavender
        fluidGrad.addColorStop(0.35, "rgba(192, 132, 252, 0.2)"); // Light purple
        fluidGrad.addColorStop(0.7, "rgba(244, 114, 182, 0.18)"); // Soft rose
        fluidGrad.addColorStop(1, "rgba(125, 211, 252, 0.2)"); // Soft sky blue

        ctx.fillStyle = fluidGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Soft ambient light reflection inside glass
      const glassSheen = ctx.createRadialGradient(
        width * 0.5,
        0,
        10,
        width * 0.5,
        0,
        width * 0.7
      );
      glassSheen.addColorStop(0, dark ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.4)");
      glassSheen.addColorStop(0.5, dark ? "rgba(139, 92, 246, 0.05)" : "rgba(139, 92, 246, 0.03)");
      glassSheen.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glassSheen;
      ctx.fillRect(0, 0, width, height);

      // 3. Carve out voids where the cursor moves
      if (voidNodes.length > 0) {
        ctx.globalCompositeOperation = "destination-out";

        for (let i = 0; i < voidNodes.length; i++) {
          const node = voidNodes[i];

          if (node.radius < node.maxRadius) {
            node.radius += (node.maxRadius - node.radius) * 0.25;
          }

          node.strength *= 0.94;
          node.life -= 0.025;

          const currentRadius = node.radius * node.strength;
          if (currentRadius > 1) {
            const radial = ctx.createRadialGradient(
              node.x,
              node.y,
              0,
              node.x,
              node.y,
              currentRadius
            );
            radial.addColorStop(0, "rgba(0, 0, 0, 1)");
            radial.addColorStop(0.75, "rgba(0, 0, 0, 0.9)");
            radial.addColorStop(1, "rgba(0, 0, 0, 0)");

            ctx.fillStyle = radial;
            ctx.beginPath();
            ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.globalCompositeOperation = "source-over";
      }

      ctx.restore();

      // 4. Refined Glass Refraction Meniscus Edge
      if (voidNodes.length > 0) {
        ctx.save();
        for (let i = 0; i < voidNodes.length; i++) {
          const node = voidNodes[i];
          const currentRadius = node.radius * node.strength;

          if (currentRadius > 4 && node.strength > 0.08) {
            ctx.beginPath();
            const points = 16;
            for (let p = 0; p <= points; p++) {
              const angle = (p / points) * Math.PI * 2;
              const wobble =
                Math.sin(angle * 4 + node.wobbleOffset + frameCount * 0.08) *
                (2.5 * node.strength);
              const r = currentRadius + wobble;
              const px = node.x + Math.cos(angle) * r;
              const py = node.y + Math.sin(angle) * r;
              if (p === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();

            // Crisp refraction line
            ctx.strokeStyle = dark
              ? `rgba(255, 255, 255, ${node.strength * 0.45})`
              : `rgba(124, 58, 237, ${node.strength * 0.4})`;
            ctx.lineWidth = 1.5 * node.strength;
            ctx.shadowColor = dark ? "#818cf8" : "#a855f7";
            ctx.shadowBlur = 8;
            ctx.stroke();

            // Subtle halo
            ctx.strokeStyle = dark
              ? `rgba(139, 92, 246, ${node.strength * 0.25})`
              : `rgba(217, 70, 239, ${node.strength * 0.25})`;
            ctx.lineWidth = 3.5 * node.strength;
            ctx.shadowColor = dark ? "#c084fc" : "#ec4899";
            ctx.shadowBlur = 12;
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // 5. Draw Subtle Displaced Droplets
      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.x += d.vx;
        d.y += d.vy;
        d.vx *= 0.96;
        d.vy *= 0.96;
        d.alpha -= 0.03;

        if (d.alpha <= 0) {
          droplets.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.globalAlpha = d.alpha;
        ctx.shadowColor = dark ? "#818cf8" : "#a855f7";
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }

      // Clean up finished nodes
      for (let i = voidNodes.length - 1; i >= 0; i--) {
        if (voidNodes[i].strength <= 0.01 || voidNodes[i].life <= 0) {
          voidNodes.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        ref={containerRef}
        className="relative rounded-3xl overflow-hidden p-8 sm:p-14 text-center border border-slate-200/80 dark:border-white/10 shadow-2xl shadow-violet-500/5 dark:shadow-black/40 cursor-crosshair transition-all duration-300 group select-none backdrop-blur-2xl bg-white/80 dark:bg-slate-900/40"
      >
        {/* Dynamic Frosted Liquid Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Ambient Corner Aurora Mesh Glows */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-violet-600/10 dark:bg-violet-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-pink-600/5 dark:bg-pink-600/10 blur-3xl pointer-events-none" />

        {/* Diagonal Frosted Glass Specular Sheen */}
        <div
          className="absolute inset-0 pointer-events-none rounded-3xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.05) 35%, transparent 60%)",
            boxShadow:
              "inset 0 1px 1px 0 rgba(255, 255, 255, 0.6), inset 0 0 30px 0 rgba(139, 92, 246, 0.03)",
          }}
        />

        {/* Content Layer (High-Contrast Typography & Action CTA in both modes) */}
        <div className="relative z-10 max-w-2xl mx-auto space-y-6 pointer-events-none">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-xl shadow-sm pointer-events-auto text-xs font-semibold bg-violet-100/90 dark:bg-white/10 text-violet-700 dark:text-white border border-violet-200/80 dark:border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-amber-300 fill-violet-600/30 dark:fill-amber-300/70" />
            <span className="tracking-wide">Interactive Omnimodal Workspace</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
            Ready to Create 10x Faster with Unified AI?
          </h2>

          {/* Subtitle */}
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-medium">
            Join thousands of developers, creators, and entrepreneurs using Genius.ai to
            converse, code, and generate visual media without limits.
          </p>

          {/* CTA Button */}
          <div className="pt-2 pointer-events-auto">
            <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
              <Button
                size="lg"
                className="rounded-full px-8 py-6 text-base font-bold bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white shadow-xl shadow-purple-500/25 hover:scale-105 hover:shadow-purple-500/40 transition-all group/btn border-0"
              >
                <Sparkles className="w-4 h-4 mr-2 fill-white/80 group-hover/btn:rotate-12 transition-transform" />
                Get Started For Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            No credit card required • Instant access in 10 seconds
          </p>
        </div>
      </div>
    </section>
  );
};
