"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

export default function WishlistHeart() {
  const [liked, setLiked] = useState(false);
  return (
    <button
      aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setLiked((v) => !v);
      }}
      className="absolute right-3 top-3 transition active:scale-90"
    >
      <Heart
        size={24}
        className={
          liked
            ? "fill-brand text-brand drop-shadow"
            : "fill-black/40 text-white drop-shadow"
        }
      />
    </button>
  );
}
