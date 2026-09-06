export const clerkAuthAppearance = {
  layout: {
    socialButtonsPlacement: "top" as const,
    logoPlacement: "none" as const,
  },
  variables: {
    colorPrimary: "#8B5CF6",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full max-w-[420px] mx-auto",
    card: "border border-border/80 bg-card/95 dark:bg-zinc-950/90 backdrop-blur-2xl shadow-2xl rounded-2xl p-6 sm:p-8 transition-colors",
    headerTitle: "text-foreground font-extrabold text-xl sm:text-2xl tracking-tight text-center",
    headerSubtitle: "text-muted-foreground text-xs sm:text-sm text-center mt-1",
    formButtonPrimary:
      "bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-md shadow-violet-500/25 active:scale-[0.99] transition-all py-2.5 cursor-pointer",
    socialButtonsBlockButton:
      "border border-border/80 hover:bg-secondary/70 dark:hover:bg-white/5 text-foreground font-medium rounded-xl transition-all py-2.5 cursor-pointer",
    socialButtonsBlockButtonText: "text-foreground font-medium text-xs sm:text-sm",
    dividerLine: "bg-border/60",
    dividerText: "text-muted-foreground text-xs font-medium uppercase tracking-wider",
    formFieldLabel: "text-foreground/90 font-semibold text-xs",
    formFieldInput:
      "bg-secondary/40 dark:bg-white/[0.04] border-border/80 focus:border-violet-500 text-foreground rounded-xl transition-all px-3 py-2 text-sm",
    footer: "border-t border-border/40 pt-4 mt-4",
    footerActionText: "text-muted-foreground text-xs sm:text-sm",
    footerActionLink:
      "text-violet-600 dark:text-violet-400 hover:text-violet-500 font-semibold text-xs sm:text-sm transition-colors",
    identityPreviewText: "text-foreground font-medium text-sm",
    identityPreviewEditButton: "text-violet-600 dark:text-violet-400 hover:text-violet-500 text-xs font-semibold",
    formFieldErrorText: "text-red-500 text-xs mt-1",
    alert: "bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl",
    alertText: "text-red-500 text-xs",
  },
};
