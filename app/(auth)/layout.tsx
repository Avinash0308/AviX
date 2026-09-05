const AuthLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-hidden p-4">
      {/* Aurora Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] aurora-glow-1 pointer-events-none blur-3xl opacity-50 -z-10" />
      <div className="relative z-10">
        {children}
      </div>
    </main>
  );
}

export default AuthLayout;