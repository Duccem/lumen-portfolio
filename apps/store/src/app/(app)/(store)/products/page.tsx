"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import { Header } from "@/components/sections/store/navigation";
import { Footer } from "@/components/sections/store/footer";
import { useCart } from "@/components/sections/store/cart/cart-context";

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
    category: "labios",
  },
  {
    id: "gloss-cristal",
    name: "Gloss Cristal",
    description: "Brillo espejo sin sensación pegajosa",
    price: 62,
    originalPrice: null,
    image: "/images/products/cream-jars-colored.png",
    badge: null,
    category: "labios",
  },
  {
    id: "delineador-labial-nude",
    name: "Delineador Labial Nude",
    description: "Trazo preciso y suave",
    price: 78,
    originalPrice: null,
    image: "/images/products/serum-bottles-1.png",
    badge: "Nuevo",
    category: "labios",
  },
  {
    id: "tinta-labios-cereza",
    name: "Tinta de Labios Cereza",
    description: "Acabado natural de larga fijación",
    price: 58,
    originalPrice: 68,
    image: "/images/products/tube-bottles.png",
    badge: "Oferta",
    category: "labios",
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
    category: "rostro",
  },
  {
    id: "corrector-soft-focus",
    name: "Corrector Soft Focus",
    description: "Cubre ojeras y unifica el tono",
    price: 38,
    originalPrice: 48,
    image: "/images/products/cream-jars-colored.png",
    badge: "Oferta",
    category: "rostro",
  },
  {
    id: "rubor-crema-peach",
    name: "Rubor en Crema Peach",
    description: "Color modulable y efecto saludable",
    price: 64,
    originalPrice: null,
    image: "/images/products/serum.jpg",
    badge: "Más vendido",
    category: "rostro",
  },
  {
    id: "polvo-compacto-air",
    name: "Polvo Compacto Air",
    description: "Sella el maquillaje con acabado suave",
    price: 58,
    originalPrice: null,
    image: "/images/products/eye-serum-bottles.png",
    badge: null,
    category: "rostro",
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
    category: "ojos",
  },
  {
    id: "mascara-volume-lift",
    name: "Máscara Volume Lift",
    description: "Volumen y definición sin grumos",
    price: 48,
    originalPrice: null,
    image: "/images/products/serum.jpg",
    badge: null,
    category: "ojos",
  },
  {
    id: "delineador-liquido-black",
    name: "Delineador Líquido Black",
    description: "Punta fina de alta precisión",
    price: 42,
    originalPrice: null,
    image: "/images/products/serum-bottles-1.png",
    badge: null,
    category: "ojos",
  },
  {
    id: "gel-cejas-fix",
    name: "Gel de Cejas Fix",
    description: "Fijación flexible durante todo el día",
    price: 56,
    originalPrice: null,
    image: "/images/products/tube-bottles.png",
    badge: "Más vendido",
    category: "ojos",
  },
  // Accesorios
  {
    id: "set-brochas-pro",
    name: "Set de Brochas Pro",
    description: "Kit completo para rostro y ojos",
    price: 45,
    originalPrice: null,
    image: "/images/products/0ed61900-dd29-4dd2-bc2d-abc2db54c352.png",
    badge: null,
    category: "accesorios",
  },
  {
    id: "esponja-soft-blend",
    name: "Esponja Soft Blend",
    description: "Difuminado uniforme y natural",
    price: 32,
    originalPrice: null,
    image: "/images/products/cream-jars-colored.png",
    badge: "Nuevo",
    category: "accesorios",
  },
];

const categories = ["todo", "labios", "rostro", "ojos", "accesorios"];

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("todo");
  const [showFilters, setShowFilters] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredProducts =
    selectedCategory === "todo"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => {
      if (gridRef.current) {
        observer.unobserve(gridRef.current);
      }
    };
  }, []);

  // Reset animation when category changes
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-sm tracking-[0.3em] uppercase text-primary mb-4 block">
              Nuestra colección
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 text-balance">
              Comprar maquillaje
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Descubre nuestra selección completa para labios, rostro y ojos
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-border/50">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden inline-flex items-center gap-2 text-sm text-foreground"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
            </button>

            {/* Desktop Categories */}
            <div className="hidden lg:flex items-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm capitalize boty-transition bg-popover ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground/70 hover:text-foreground boty-shadow"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <span className="text-sm text-muted-foreground">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "producto" : "productos"}
            </span>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-background">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-serif text-2xl text-foreground">
                    Filtros
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="p-2 text-foreground/70 hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowFilters(false);
                      }}
                      className={`w-full px-6 py-4 rounded-2xl text-left capitalize boty-transition ${
                        selectedCategory === category
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground boty-shadow"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div
            ref={gridRef}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function ProductCard({
  product,
  index,
  isVisible,
}: {
  product: (typeof products)[0];
  index: number;
  isVisible: boolean;
}) {
  const { addItem } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link
      href={`/products/${product.id}`}
      className={`group transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="bg-card rounded-3xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02]">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {/* Skeleton */}
          <div
            className={`absolute inset-0 bg-gradient-to-br from-muted via-muted/50 to-muted animate-pulse transition-opacity duration-500 ${
              imageLoaded ? "opacity-0" : "opacity-100"
            }`}
          />

          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className={`object-cover boty-transition group-hover:scale-105 transition-opacity duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {/* Badge */}
          {product.badge && (
            <span
              className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wide ${
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
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 boty-transition boty-shadow cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                description: product.description,
              });
            }}
            aria-label="Agregar al carrito"
          >
            <ShoppingBag className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Info */}
        <div className="p-6">
          <h3 className="font-serif text-xl text-foreground mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {product.description}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-foreground">
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
  );
}

