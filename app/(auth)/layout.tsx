import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";

const AuthLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden">
      {/* Top Header Bar */}
      <header className="w-full px-4 sm:px-8 py-4 flex items-center justify-between z-20 shrink-0">
        <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
          <div className="relative w-8 h-8">
            <Image src="/logo.png" alt="Genius.ai Logo" fill className="object-contain" priority />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">
            Genius<span className="text-violet-500">.ai</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 my-auto pb-8">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[450px] bg-gradient-to-tr from-violet-600/30 via-purple-600/20 to-pink-500/25 pointer-events-none blur-3xl opacity-60 -z-10 rounded-full" />
        <div className="w-full flex justify-center">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;