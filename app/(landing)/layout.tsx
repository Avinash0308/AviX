import { CursorGlow } from "@/components/cursor-glow";

const LandingLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-x-hidden">
      <CursorGlow />
      {children}
    </main>
  );
};

export default LandingLayout;