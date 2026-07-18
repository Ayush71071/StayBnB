"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Globe2,
  Mountain,
  TreePine,
  Waves,
  Shapes,
  Palmtree,
  Snowflake,
  Trees,
  Building2,
  Sparkles,
  Sailboat,
  Wheat,
} from "lucide-react";

const CATEGORIES: { name: string; icon: React.ElementType }[] = [
  { name: "All", icon: Globe2 },
  { name: "Amazing views", icon: Mountain },
  { name: "Cabins", icon: TreePine },
  { name: "Beachfront", icon: Waves },
  { name: "Design", icon: Shapes },
  { name: "Tropical", icon: Palmtree },
  { name: "Skiing", icon: Snowflake },
  { name: "Treehouses", icon: Trees },
  { name: "City", icon: Building2 },
  { name: "OMG!", icon: Sparkles },
  { name: "Lakefront", icon: Sailboat },
  { name: "Countryside", icon: Wheat },
];

export default function CategoryBar() {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("category") ?? "All";

  function select(name: string) {
    const p = new URLSearchParams(params.toString());
    if (name === "All") p.delete("category");
    else p.set("category", name);
    router.push(`/?${p.toString()}#stays`, { scroll: false });
  }

  return (
    <div className="no-scrollbar flex gap-8 overflow-x-auto py-3">
      {CATEGORIES.map(({ name, icon: Icon }) => {
        const isActive = active === name;
        return (
          <button
            key={name}
            onClick={() => select(name)}
            className={`flex shrink-0 flex-col items-center gap-1.5 border-b-2 pb-2.5 pt-1 transition ${
              isActive
                ? "border-ink text-ink"
                : "border-transparent text-muted hover:border-gray-300 hover:text-ink"
            }`}
          >
            <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
            <span className="whitespace-nowrap text-xs font-semibold">{name}</span>
          </button>
        );
      })}
    </div>
  );
}
