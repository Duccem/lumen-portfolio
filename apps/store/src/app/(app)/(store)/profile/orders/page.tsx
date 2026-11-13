import Link from "next/link";

const orders = [
  {
    id: "SLM-104298",
    date: "15 feb 2026",
    total: "$126.00",
    status: "Entregado",
  },
  {
    id: "SLM-103771",
    date: "29 ene 2026",
    total: "$72.00",
    status: "En tránsito",
  },
];

export default function OrdersPage() {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8">
      <h2 className="font-serif text-3xl text-foreground mb-3">Pedidos</h2>
      <p className="text-muted-foreground mb-6">
        Revisa tus compras recientes.
      </p>

      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/profile/orders/${order.id.toLowerCase()}`}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-border/50 p-4 hover:bg-muted boty-transition"
          >
            <div>
              <p className="font-medium text-foreground">{order.id}</p>
              <p className="text-sm text-muted-foreground">{order.date}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-medium text-foreground">{order.total}</p>
              <p className="text-sm text-muted-foreground">{order.status}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

