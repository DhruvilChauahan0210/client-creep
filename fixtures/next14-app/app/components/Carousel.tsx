// No "use client" — but pulled in by ProductCard (a client boundary)
// This is accidental creep: it has no client signals of its own

interface Props {
  images: string[];
}

export function Carousel({ images }: Props) {
  return (
    <div className="carousel">
      {images.map((src, i) => (
        <img key={i} src={src} alt="" />
      ))}
    </div>
  );
}
