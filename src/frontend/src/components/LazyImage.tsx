import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function LazyImage({ src, alt, className, fallback }: LazyImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {!inView ? (
        (fallback ?? <Skeleton className="w-full h-full rounded-full" />)
      ) : (
        <>
          {!loaded &&
            (fallback ?? <Skeleton className="w-full h-full rounded-full" />)}
          <img
            src={src}
            alt={alt}
            className={`${className} ${loaded ? "block" : "hidden"}`}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
          />
        </>
      )}
    </div>
  );
}
