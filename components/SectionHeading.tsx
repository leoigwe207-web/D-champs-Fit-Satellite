export default function SectionHeading({
  eyebrow,
  title,
  center = false,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2
        className={`mt-2 font-display text-4xl leading-none tracking-wide sm:text-5xl ${
          light ? "text-ink" : "text-white"
        }`}
      >
        {title}
      </h2>
    </div>
  );
}
