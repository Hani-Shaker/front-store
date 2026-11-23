const SectionTitle = ({ children, subtitle, action }) => (
  <div className="mb-8 flex items-end justify-between gap-4">
    <div>
      <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">{children}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      <div className="mt-3 h-1 w-14 rounded-full bg-gradient-gold" />
    </div>
    {action}
  </div>
);

export default SectionTitle;
