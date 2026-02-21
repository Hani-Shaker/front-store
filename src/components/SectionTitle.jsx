const SectionTitle = ({ children, subtitle }) => (
  <div className="mb-8 text-center md:text-right">
    <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">{children}</h2>
    {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    <div className="mt-3 h-1 w-16 rounded-full bg-gradient-gold mx-auto md:mx-0" />
  </div>
);

export default SectionTitle;
