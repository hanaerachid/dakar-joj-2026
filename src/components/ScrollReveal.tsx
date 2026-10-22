import { useEffect, useRef, useState } from "react";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Respect users who prefer reduced motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[
        "transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-6 opacity-0",
        className,
      ].join(" ")}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

import { type ComponentType } from "react";

type ScrollRevealOptions = {
  delay?: number;
  className?: string;
};

export function scrollReveal<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: ScrollRevealOptions = {},
) {
  function WithScrollReveal(props: P) {
    return (
      <ScrollReveal
        delay={options.delay ?? 0}
        className={options.className}
      >
        <WrappedComponent {...props} />
      </ScrollReveal>
    );
  }

  WithScrollReveal.displayName =
    `scrollReveal(${WrappedComponent.displayName ?? WrappedComponent.name ?? "Component"})`;

  return WithScrollReveal;
}
