import Link from "next/link";

export default function OrderDetailPage() {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8">
      <h2 className="font-serif text-3xl text-foreground mb-3">
        Detalle del pedido
      </h2>
      <p className="text-muted-foreground mb-6">
        Esta vista de detalle está lista para integrar datos del backend.
      </p>

      <Link
        href="/profile/orders"
        className="inline-flex px-5 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-muted boty-transition"
      >
        Volver a pedidos
      </Link>
    </div>
  );
}

