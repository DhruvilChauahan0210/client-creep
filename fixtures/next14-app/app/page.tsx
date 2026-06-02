// Server component — no "use client"
import { ProductCard } from "./components/ProductCard";
import { StaticBanner } from "./components/StaticBanner";

export default function HomePage() {
  return (
    <main>
      <StaticBanner title="Welcome" />
      <ProductCard name="Widget" price={99} />
    </main>
  );
}
