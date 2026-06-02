// Pure server component — no client signals, no "use client"
interface Props {
  title: string;
}

export function StaticBanner({ title }: Props) {
  return <div className="banner"><h1>{title}</h1></div>;
}
