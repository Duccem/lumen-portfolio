"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  Minus,
  Plus,
  ChevronDown,
  Leaf,
  Heart,
  Award,
  Recycle,
  Star,
  Check,
} from "lucide-react";
import { Header } from "@/components/sections/store/navigation";
import { Footer } from "@/components/sections/store/footer";
import { useCart } from "@/components/sections/store/cart/cart-context";

const products: Record<
  string,
  {
    id: string;
    name: string;
    tagline: string;
    description: string;
    price: number;
    originalPrice: number | null;
    image: string;
    sizes: string[];
    details: string;
    howToUse: string;
    ingredients: string;
    delivery: string;
  }
> = {
  "labial-liquido-matte-rose": {
    id: "labial-liquido-matte-rose",
    name: "Labial Líquido Matte Rose",
    tagline: "Color intenso que dura todo el día",
    description:
      "Labial líquido de alta pigmentación con acabado matte confortable. Define tus labios con un tono elegante y uniforme desde la primera aplicación.",
    price: 68,
    originalPrice: null,
    image: "/images/products/serum.jpg",
    sizes: ["4ml", "8ml"],
    details:
      "Su fórmula de secado rápido brinda cobertura uniforme y cómoda. Incluye aplicador de precisión para perfilar fácilmente y mantener un acabado impecable por horas.",
    howToUse:
      "Aplica sobre labios limpios empezando por el centro hacia las comisuras. Deja secar unos segundos para un acabado matte perfecto.",
    ingredients:
      "Isododecane, Dimethicone, Trimethylsiloxysilicate, Polybutene, Silica, Iron Oxides, Red 7 Lake, Tocopherol.",
    delivery:
      "Envío estándar gratis en compras mayores a $50. Envío exprés disponible al finalizar compra. Despachos en 1-2 días hábiles. Devoluciones dentro de 30 días si el producto está sellado.",
  },
  "base-ligera-luminosa": {
    id: "base-ligera-luminosa",
    name: "Base Ligera Luminosa",
    tagline: "Cobertura media con acabado natural",
    description:
      "Base fluida que unifica el tono y deja un efecto segunda piel. Ideal para looks frescos de día y construible para mayor cobertura.",
    price: 54,
    originalPrice: null,
    image: "/images/products/serum.jpg",
    sizes: ["30ml", "45ml"],
    details:
      "Su textura ligera se difumina fácilmente con brocha, esponja o dedos. Ofrece acabado luminoso controlado, sin sensación pesada.",
    howToUse:
      "Aplica una pequeña cantidad en el centro del rostro y difumina hacia afuera. Ajusta la cobertura por capas según el acabado deseado.",
    ingredients:
      "Aqua, Dimethicone, Cyclopentasiloxane, Glycerin, Titanium Dioxide, Iron Oxides, Niacinamide, Tocopherol.",
    delivery:
      "Envío estándar gratis en compras mayores a $50. Envío exprés disponible al finalizar compra. Despachos en 1-2 días hábiles. Devoluciones dentro de 30 días si el producto está sellado.",
  },
  "paleta-sombras-sunset": {
    id: "paleta-sombras-sunset",
    name: "Paleta de Sombras Sunset",
    tagline: "Tonos cálidos para looks versátiles",
    description:
      "Paleta de 12 tonos matte y satinados con alta pigmentación. Perfecta para transiciones suaves y acabados intensos.",
    price: 38,
    originalPrice: 48,
    image: "/images/products/serum.jpg",
    sizes: ["12 tonos", "18 tonos"],
    details:
      "Sombras fáciles de difuminar, ideales para crear desde maquillaje natural hasta looks de noche. Incluye tonos base, transición y profundidad.",
    howToUse:
      "Aplica un tono de transición en la cuenca y construye intensidad en el párpado. Finaliza con un tono iluminador en el lagrimal.",
    ingredients:
      "Talc, Mica, Dimethicone, Magnesium Stearate, Titanium Dioxide, Iron Oxides, Ultramarines, Silica.",
    delivery:
      "Envío estándar gratis en compras mayores a $50. Envío exprés disponible al finalizar compra. Despachos en 1-2 días hábiles. Devoluciones dentro de 30 días si el producto está sellado.",
  },
  "mascara-volume-lift": {
    id: "mascara-volume-lift",
    name: "Máscara Volume Lift",
    tagline: "Volumen definido sin grumos",
    description:
      "Máscara de pestañas de larga duración que aporta volumen y elevación desde la raíz. Fórmula flexible para capas sin apelmazar.",
    price: 72,
    originalPrice: null,
    image: "/images/products/serum.jpg",
    sizes: ["8ml", "12ml"],
    details:
      "Cepillo de fibra diseñado para separar y dar volumen a cada pestaña. Resiste humedad y mantiene el rizo por horas.",
    howToUse:
      "Desliza el cepillo desde la raíz hacia las puntas con movimientos en zigzag. Repite para mayor intensidad.",
    ingredients:
      "Aqua, Acrylates Copolymer, Beeswax, Carnauba Wax, Iron Oxides, Panthenol, Phenoxyethanol.",
    delivery:
      "Envío estándar gratis en compras mayores a $50. Envío exprés disponible al finalizar compra. Despachos en 1-2 días hábiles. Devoluciones dentro de 30 días si el producto está sellado.",
  },
};

const benefits = [
  { icon: Leaf, label: "Fórmula cuidada" },
  { icon: Heart, label: "Cruelty free" },
  { icon: Recycle, label: "Empaque responsable" },
  { icon: Award, label: "Aprobado por expertos" },
];

type AccordionSection = "details" | "howToUse" | "ingredients" | "delivery";

export default function ProductPage() {
  const params = useParams();
  const productId = params.slug as string;
  const product = products[productId] || products["labial-liquido-matte-rose"];

  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<AccordionSection | null>(
    "details",
  );
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  const toggleAccordion = (section: AccordionSection) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const handleAddToCart = () => {
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
    addItem({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
    });
  };

  const accordionItems: {
    key: AccordionSection;
    title: string;
    content: string;
  }[] = [
    { key: "details", title: "Detalles", content: product.details },
    { key: "howToUse", title: "Modo de uso", content: product.howToUse },
    { key: "ingredients", title: "Ingredientes", content: product.ingredients },
    {
      key: "delivery",
      title: "Envíos y devoluciones",
      content: product.delivery,
    },
  ];

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground boty-transition mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver a la tienda
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Product Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-card boty-shadow">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Header */}
              <div className="mb-8">
                <span className="text-sm tracking-[0.3em] uppercase text-primary mb-2 block">
                  Esenciales Glow Market
                </span>
                <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">
                  {product.name}
                </h1>
                <p className="text-lg text-muted-foreground italic mb-4">
                  {product.tagline}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    (128 reseñas)
                  </span>
                </div>

                <p className="text-foreground/80 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl font-medium text-foreground">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              {/* Size Selector */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Tamaño
                </label>
                <div className="flex gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 rounded-full text-sm boty-transition boty-shadow ${
                        selectedSize === size
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground hover:bg-card/80"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Cantidad
                </label>
                <div className="inline-flex items-center gap-4 bg-card rounded-full px-2 py-2 boty-shadow">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium text-foreground">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm tracking-wide boty-transition boty-shadow ${
                    isAdded
                      ? "bg-primary/80 text-primary-foreground"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      Agregado al carrito
                    </>
                  ) : (
                    "Agregar al carrito"
                  )}
                </button>
                <button
                  type="button"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-transparent border border-foreground/20 text-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-foreground/5"
                >
                  Comprar ahora
                </button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                {benefits.map((benefit) => (
                  <div
                    key={benefit.label}
                    className="flex flex-col items-center gap-2 p-4 boty-shadow bg-transparent shadow-none rounded-md"
                  >
                    <benefit.icon className="w-5 h-5 text-primary" />
                    <span className="text-xs text-muted-foreground text-center">
                      {benefit.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Accordion */}
              <div className="border-t border-border/50">
                {accordionItems.map((item) => (
                  <div key={item.key} className="border-b border-border/50">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(item.key)}
                      className="w-full flex items-center justify-between py-5 text-left"
                    >
                      <span className="font-medium text-foreground">
                        {item.title}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground boty-transition ${
                          openAccordion === item.key ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden boty-transition ${
                        openAccordion === item.key ? "max-h-96 pb-5" : "max-h-0"
                      }`}
                    >
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

