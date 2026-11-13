"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart/cart-context";

type Category = "labios" | "rostro" | "ojos";

const products = [
  // Labios
  {
    id: "labial-liquido-matte-rose",
    name: "Labial Líquido Matte Rose",
    description: "Color intenso de larga duración",
    price: 68,
    originalPrice: null,
    image: "/images/products/serum.jpg",
    badge: "Más vendido",
    category: "labios" as Category,
  },
  {
    id: "gloss-cristal",
    name: "Gloss Cristal",
    description: "Brillo espejo sin sensación pegajosa",
    price: 62,
    originalPrice: null,
    image: "/images/products/cream-jars-colored.png",
    badge: null,
    category: "labios" as Category,
  },
  {
    id: "delineador-labial-nude",
    name: "Delineador Labial Nude",
    description: "Trazo preciso y suave",
    price: 78,
    originalPrice: null,
    image: "/images/products/serum.jpg",
    badge: "Nuevo",
    category: "labios" as Category,
  },
  {
    id: "tinta-labios-cereza",
    name: "Tinta de Labios Cereza",
    description: "Acabado natural de larga fijación",
    price: 58,
    originalPrice: 68,
    image: "/images/products/tube-bottles.png",
    badge: "Oferta",
    category: "labios" as Category,
  },
  // Rostro
  {
    id: "base-ligera-luminosa",
    name: "Base Ligera Luminosa",
    description: "Cobertura media con acabado natural",
    price: 54,
    originalPrice: null,
    image: "/images/products/serum-bottles-1.png",
    badge: null,
    category: "rostro" as Category,
  },
  {
    id: "corrector-soft-focus",
    name: "Corrector Soft Focus",
    description: "Cubre ojeras y unifica el tono",
    price: 38,
    originalPrice: 48,
    image: "/images/products/cream-jars-colored.png",
    badge: "Oferta",
    category: "rostro" as Category,
  },
  {
    id: "rubor-crema-peach",
    name: "Rubor en Crema Peach",
    description: "Color modulable y efecto saludable",
    price: 64,
    originalPrice: null,
    image: "/images/products/serum.jpg",
    badge: "Más vendido",
    category: "rostro" as Category,
  },
  {
    id: "polvo-compacto-air",
    name: "Polvo Compacto Air",
    description: "Sella el maquillaje con acabado suave",
    price: 58,
    originalPrice: null,
    image: "/images/products/eye-serum-bottles.png",
    badge: null,
    category: "rostro" as Category,
  },
  // Ojos
  {
    id: "paleta-sombras-sunset",
    name: "Paleta de Sombras Sunset",
    description: "12 tonos cálidos altamente pigmentados",
    price: 72,
    originalPrice: null,
    image: "/images/products/eye-serum-bottles.png",
    badge: "Nuevo",
    category: "ojos" as Category,
  },
  {
    id: "mascara-volume-lift",
    name: "Máscara Volume Lift",
    description: "Volumen y definición sin grumos",
    price: 48,
    originalPrice: null,
    image: "/images/products/serum.jpg",
    badge: null,
    category: "ojos" as Category,
  },
  {
    id: "delineador-liquido-black",
    name: "Delineador Líquido Black",
    description: "Punta fina de alta precisión",
    price: 42,
    originalPrice: null,
    image: "/images/products/serum-bottles-1.png",
    badge: null,
    category: "ojos" as Category,
  },
  {
    id: "gel-cejas-fix",
    name: "Gel de Cejas Fix",
    description: "Fijación flexible durante todo el día",
    price: 56,
    originalPrice: null,
    image: "/images/products/tube-bottles.png",
    badge: "Más vendido",
    category: "ojos" as Category,
  },
];

const categories = [
  { value: "rostro" as Category, label: "Rostro" },
  { value: "ojos" as Category, label: "Ojos" },
  { value: "labios" as Category, label: "Labios" },
];

export function FeatureProducts() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("rostro");
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory,
  );

  const handleCategoryChange = (category: Category) => {
    if (category !== selectedCategory) {
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedCategory(category);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 300);
    }
  };

  // Preload all product images on mount
  useEffect(() => {
    products.forEach((product) => {
      const img = new window.Image();
      img.src = product.image;
    });
  }, []);

  useEffect(() => {
    const gridObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (gridRef.current) {
      gridObserver.observe(gridRef.current);
    }

    if (headerRef.current) {
      headerObserver.observe(headerRef.current);
    }

    return () => {
      if (gridRef.current) {
        gridObserver.unobserve(gridRef.current);
      }
      if (headerRef.current) {
        headerObserver.unobserve(headerRef.current);
      }
    };
  }, []);

  return (
    <section className="py-24 bg-card">
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
            Nuestra colección
          </span>
          <h2
            className={`font-serif leading-tight text-foreground mb-4 text-balance text-7xl ${headerVisible ? "animate-blur-in opacity-0" : "opacity-0"}`}
            style={
              headerVisible
                ? { animationDelay: "0.4s", animationFillMode: "forwards" }
                : {}
            }
          >
            Esenciales de maquillaje
          </h2>
          <p
            className={`text-lg text-muted-foreground max-w-md mx-auto ${headerVisible ? "animate-blur-in opacity-0" : "opacity-0"}`}
            style={
              headerVisible
                ? { animationDelay: "0.6s", animationFillMode: "forwards" }
                : {}
            }
          >
            Productos creados para tu rutina diaria de maquillaje
          </p>
        </div>

        {/* Segmented Control */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-background rounded-full p-1 gap-1 relative">
            {/* Animated background slide */}
            <div
              className="absolute top-1 bottom-1 bg-foreground rounded-full transition-all duration-300 ease-out shadow-sm"
              style={{
                left:
                  selectedCategory === "rostro"
                    ? "4px"
                    : selectedCategory === "ojos"
                      ? "calc(33.333% + 2px)"
                      : "calc(66.666%)",
                width: "calc(33.333% - 4px)",
              }}
            />
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => handleCategoryChange(category.value)}
                className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.value
                    ? "text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <Link
              key={`${selectedCategory}-${product.id}`}
              href={`/products/${product.id}`}
              className={`group transition-all duration-500 ease-out ${
                isVisible && !isTransitioning
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95"
              }`}
              style={{
                transitionDelay: isTransitioning ? "0ms" : `${index * 80}ms`,
              }}
            >
              <div className="bg-background rounded-3xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02]">
                {/* Image */}
                <div className="relative aspect-square bg-muted overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover boty-transition group-hover:scale-105"
                  />
                  {/* Badge */}
                  {product.badge && (
                    <span
                      className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wide bg-white text-black ${
                        product.badge === "Oferta"
                          ? "bg-destructive/10 text-destructive"
                          : product.badge === "Nuevo"
                            ? "bg-primary/10 text-primary"
                            : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {product.badge}
                    </span>
                  )}
                  {/* Quick add button */}
                  <button
                    type="button"
                    className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 boty-transition boty-shadow"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addItem({
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        image: product.image,
                      });
                    }}
                    aria-label="Agregar al carrito"
                  >
                    <ShoppingBag className="w-4 h-4 text-foreground" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-serif text-lg text-foreground mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-transparent border border-foreground/20 text-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-foreground/5"
          >
            Ver todos los productos
          </Link>
        </div>
      </div>
    </section>
  );
}

