export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-flame bg-background text-foreground min-h-screen selection:bg-primary/30 selection:text-foreground">
      {children}
    </div>
  );
}
