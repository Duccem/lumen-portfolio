"use client";

import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    location: "New York",
    rating: 5,
    text: "El Labial Líquido Matte Rose dura horas y el color se ve increíble desde la primera pasada.",
    product: "Labial Líquido Matte Rose",
  },
  {
    id: 2,
    name: "Emma L.",
    location: "Los Angeles",
    rating: 5,
    text: "La base es súper ligera, no se siente pesada y deja un acabado natural precioso.",
    product: "Base Ligera Luminosa",
  },
  {
    id: 3,
    name: "Jessica R.",
    location: "Chicago",
    rating: 5,
    text: "La máscara Volume Lift me abre la mirada sin grumos. Se volvió mi favorita.",
    product: "Máscara Volume Lift",
  },
  {
    id: 4,
    name: "Maria K.",
    location: "Miami",
    rating: 5,
    text: "La paleta Sunset tiene tonos pigmentados y fáciles de difuminar, perfecta para diario o noche.",
    product: "Paleta de Sombras Sunset",
  },
  {
    id: 5,
    name: "Sophie T.",
    location: "Seattle",
    rating: 5,
    text: "El empaque es precioso y práctico. Se nota el cuidado en cada detalle de la marca.",
    product: "Rubor en Crema Peach",
  },
  {
    id: 6,
    name: "Anna P.",
    location: "Boston",
    rating: 5,
    text: "El corrector cubre súper bien las ojeras y no se cuartea durante el día.",
    product: "Corrector Soft Focus",
  },
  {
    id: 7,
    name: "Claire B.",
    location: "Austin",
    rating: 5,
    text: "El delineador es preciso y no se corre; ideal para un cat eye rápido.",
    product: "Delineador Líquido Black",
  },
  {
    id: 8,
    name: "Lily W.",
    location: "Portland",
    rating: 5,
    text: "Me encanta que sea cruelty free. Son productos buenísimos y alineados con mis valores.",
    product: "Gloss Cristal",
  },
  {
    id: 9,
    name: "Rachel D.",
    location: "Denver",
    rating: 5,
    text: "El polvo compacto controla el brillo sin apagar la piel. Acabado impecable.",
    product: "Polvo Compacto Air",
  },
];

const TestimonialCard = ({
  testimonial,
}: {
  testimonial: (typeof testimonials)[0];
}) => (
  <div
    className="rounded-3xl p-6 bg-white mb-4 flex-shrink-0"
    style={{
      boxShadow:
        "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px",
    }}
  >
    {/* Stars */}

    {/* Quote */}
    <p className="text-foreground/80 leading-relaxed mb-4 text-pretty font-medium text-xl font-serif tracking-wide">
      &ldquo;{testimonial.text}&rdquo;
    </p>

    {/* Author */}
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-foreground text-sm font-bold">{testimonial.name}</p>
        <p className="text-xs text-muted-foreground">{testimonial.location}</p>
      </div>
      <span className="text-xs tracking-wide text-primary/70 bg-primary/5 px-2 py-1 rounded-full whitespace-nowrap">
        {testimonial.product}
      </span>
    </div>
  </div>
);

export function Testimonials() {
  const [headerVisible, setHeaderVisible] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const column1 = [testimonials[0], testimonials[3], testimonials[6]];
  const column2 = [testimonials[1], testimonials[4], testimonials[7]];
  const column3 = [testimonials[2], testimonials[5], testimonials[8]];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current);
      }
    };
  }, []);

  return (
    <section className="py-24 bg-background overflow-hidden pb-24 pt-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span
            className={`text-sm tracking-[0.3em] uppercase text-primary mb-4 block ${headerVisible ? "animate-blur-in opacity-0" : "opacity-0"}`}
            style={
              headerVisible
                ? { animationDelay: "0.2s", animationFillMode: "forwards" }
                : {}
            }
          >
            Opiniones reales
          </span>
          <h2
            className={`font-serif text-4xl leading-tight text-foreground text-balance md:text-7xl ${headerVisible ? "animate-blur-in opacity-0" : "opacity-0"}`}
            style={
              headerVisible
                ? { animationDelay: "0.4s", animationFillMode: "forwards" }
                : {}
            }
          >
            Favoritos de miles
          </h2>
        </div>

        {/* Scrolling Testimonials */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

          {/* Mobile - Single Column */}
          <div className="md:hidden h-[600px]">
            <div className="relative overflow-hidden h-full">
              <div className="animate-scroll-down hover:animate-scroll-down-slow">
                {[...testimonials, ...testimonials].map(
                  (testimonial, index) => (
                    <TestimonialCard
                      key={`mobile-${testimonial.id}-${index}`}
                      testimonial={testimonial}
                    />
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Desktop - Three Columns */}
          <div className="hidden md:grid md:grid-cols-3 gap-4 h-[600px]">
            {/* Column 1 - Scrolling Down */}
            <div className="relative overflow-hidden">
              <div className="animate-scroll-down hover:animate-scroll-down-slow">
                {[...column1, ...column1].map((testimonial, index) => (
                  <TestimonialCard
                    key={`col1-${testimonial.id}-${index}`}
                    testimonial={testimonial}
                  />
                ))}
              </div>
            </div>

            {/* Column 2 - Scrolling Up */}
            <div className="relative overflow-hidden">
              <div className="animate-scroll-up hover:animate-scroll-up-slow">
                {[...column2, ...column2].map((testimonial, index) => (
                  <TestimonialCard
                    key={`col2-${testimonial.id}-${index}`}
                    testimonial={testimonial}
                  />
                ))}
              </div>
            </div>

            {/* Column 3 - Scrolling Down */}
            <div className="relative overflow-hidden">
              <div className="animate-scroll-down hover:animate-scroll-down-slow">
                {[...column3, ...column3].map((testimonial, index) => (
                  <TestimonialCard
                    key={`col3-${testimonial.id}-${index}`}
                    testimonial={testimonial}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-down {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }

        @keyframes scroll-up {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }

        .animate-scroll-down {
          animation: scroll-down 30s linear infinite;
        }

        .animate-scroll-up {
          animation: scroll-up 30s linear infinite;
        }

        .animate-scroll-down-slow {
          animation: scroll-down 60s linear infinite;
        }

        .animate-scroll-up-slow {
          animation: scroll-up 60s linear infinite;
        }
      `}</style>
    </section>
  );
}

