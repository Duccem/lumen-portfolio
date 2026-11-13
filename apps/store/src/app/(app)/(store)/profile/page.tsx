import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8">
      <h2 className="font-serif text-3xl text-foreground mb-3">Resumen</h2>
      <p className="text-muted-foreground mb-8">
        Bienvenida de nuevo. Desde aquí puedes revisar tus pedidos, favoritos y
        métodos de pago.
      </p>

      <div className="grid sm:grid-cols-3 gap-4">
        <Link
          href="/profile/orders"
          className="rounded-xl border border-border/50 p-4 hover:bg-muted boty-transition"
        >
          <p className="text-sm text-muted-foreground mb-1">Pedidos</p>
          <p className="font-medium text-foreground">Ver tus compras</p>
        </Link>
        <Link
          href="/profile/favorites"
          className="rounded-xl border border-border/50 p-4 hover:bg-muted boty-transition"
        >
          <p className="text-sm text-muted-foreground mb-1">Favoritos</p>
          <p className="font-medium text-foreground">Productos guardados</p>
        </Link>
        <Link
          href="/profile/payment-methods"
          className="rounded-xl border border-border/50 p-4 hover:bg-muted boty-transition"
        >
          <p className="text-sm text-muted-foreground mb-1">Pago</p>
          <p className="font-medium text-foreground">Gestionar tarjetas</p>
        </Link>
      </div>
    </div>
  );
}

