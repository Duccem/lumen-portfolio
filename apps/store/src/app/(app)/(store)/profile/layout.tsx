"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Heart, Package, UserCircle } from "lucide-react";
import { Header } from "@/components/sections/store/navigation";
import { Footer } from "@/components/sections/store/footer";

const profileLinks: { href: Route; label: string; icon: typeof UserCircle }[] = [
  {
    href: "/profile",
    label: "Resumen",
    icon: UserCircle,
  },
  {
    href: "/profile/favorites",
    label: "Favoritos",
    icon: Heart,
  },
  {
    href: "/profile/orders",
    label: "Pedidos",
    icon: Package,
  },
  {
    href: "/profile/payment-methods",
    label: "Métodos de pago",
    icon: CreditCard,
  },
];

export default function ProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-2">
              Mi perfil
            </h1>
            <p className="text-muted-foreground">
              Gestiona tu cuenta, pedidos y preferencias.
            </p>
          </div>

          <div className="grid lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
            <aside className="bg-card border border-border/50 rounded-2xl p-3 h-fit lg:sticky lg:top-28">
              <nav className="flex lg:flex-col gap-2 overflow-x-auto">
                {profileLinks.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/profile" &&
                      pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap boty-transition ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground/70 hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            <section>{children}</section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

