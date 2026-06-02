"use client";

// This is a legit client boundary — it has interactivity
import { useState } from "react";
import { Carousel } from "./Carousel";

interface Props {
  name: string;
  price: number;
}

export function ProductCard({ name, price }: Props) {
  const [added, setAdded] = useState(false);

  return (
    <div>
      <h2>{name}</h2>
      <p>${price}</p>
      <Carousel images={[]} />
      <button onClick={() => setAdded(true)}>
        {added ? "Added!" : "Add to cart"}
      </button>
    </div>
  );
}
