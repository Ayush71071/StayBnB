import Image from "next/image";

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [main, ...rest] = images;
  const side = rest.slice(0, 4);
  return (
    <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-2xl sm:grid-cols-4 sm:grid-rows-2">
      <div className="relative aspect-[4/3] sm:col-span-2 sm:row-span-2 sm:aspect-auto">
        <Image
          src={main}
          alt={title}
          fill
          priority
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover transition duration-300 hover:brightness-95"
        />
      </div>
      {side.map((src, i) => (
        <div key={i} className="relative hidden aspect-[4/3] sm:block sm:aspect-auto sm:min-h-32">
          <Image
            src={src}
            alt={`${title} photo ${i + 2}`}
            fill
            sizes="25vw"
            className="object-cover transition duration-300 hover:brightness-95"
          />
        </div>
      ))}
    </div>
  );
}
