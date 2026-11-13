"use client";

import type { Route } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Facebook01Icon,
  InstagramIcon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";

const footerLinks: Record<string, { name: string; href: Route }[]> = {
  shop: [
    { name: "Todos los productos", href: "/products" },
    { name: "Labios", href: "/products?category=labios" },
    { name: "Rostro", href: "/products?category=rostro" },
    { name: "Ojos", href: "/products?category=ojos" },
    { name: "Sets", href: "/products" },
  ],
  about: [
    { name: "Nuestra historia", href: "/" },
    { name: "Calidad", href: "/" },
    { name: "Sostenibilidad", href: "/" },
    { name: "Prensa", href: "/" },
  ],
  support: [
    { name: "Contáctanos", href: "/" },
    { name: "FAQ", href: "/" },
    { name: "Envíos", href: "/" },
    { name: "Devoluciones", href: "/" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-card pt-20 pb-10 relative overflow-hidden">
      {/* Giant Background Text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none z-0">
        <span className="font-serif text-[200px] sm:text-[200px] md:text-[400px] lg:text-[400px] xl:text-[400px] font-bold text-white/20 whitespace-nowrap leading-none">
          Salome
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="font-serif text-3xl text-foreground mb-4">Salome</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Maquillaje para quienes quieren verse bien y sentirse auténticas
              todos los días.
            </p>
            <div className="flex gap-4">
              <a
                href="https://x.com/Kerroudjm"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition boty-shadow"
                aria-label="Instagram"
              >
                <HugeiconsIcon icon={InstagramIcon} className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/Kerroudjm"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition boty-shadow"
                aria-label="Facebook"
              >
                <HugeiconsIcon icon={Facebook01Icon} className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/Kerroudjm"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition boty-shadow"
                aria-label="Twitter"
              >
                <HugeiconsIcon icon={NewTwitterIcon} className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Tienda</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Nosotros</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Soporte</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Salome. Todos los derechos
              reservados.
            </p>
            <div className="flex gap-6">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground boty-transition"
              >
                Política de privacidad
              </Link>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground boty-transition"
              >
                Términos de servicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

