export default function PaymentMethodsPage() {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8">
      <h2 className="font-serif text-3xl text-foreground mb-3">
        Métodos de pago
      </h2>
      <p className="text-muted-foreground mb-6">
        Guarda y administra tus métodos de pago preferidos.
      </p>

      <div className="rounded-xl border border-border/50 p-4">
        <p className="font-medium text-foreground">Visa terminada en 4242</p>
        <p className="text-sm text-muted-foreground">Vence 08/28</p>
      </div>
    </div>
  );
}

