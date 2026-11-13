"use client";

import { type FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { Header } from "@/components/sections/store/navigation";
import { Footer } from "@/components/sections/store/footer";
import { useCart } from "@/components/sections/store/cart/cart-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CheckoutForm = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  notes: string;
};

const TAX_RATE = 0.12;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart, itemCount } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [form, setForm] = useState<CheckoutForm>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    notes: "",
  });

  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 8;
  const taxes = subtotal * TAX_RATE;
  const total = subtotal + shipping + taxes;

  const isFormValid = useMemo(() => {
    return (
      form.fullName.trim() !== "" &&
      form.email.trim() !== "" &&
      form.phone.trim() !== "" &&
      form.address.trim() !== "" &&
      form.city.trim() !== "" &&
      form.postalCode.trim() !== "" &&
      form.cardName.trim() !== "" &&
      form.cardNumber.trim().length >= 12 &&
      form.cardExpiry.trim() !== "" &&
      form.cardCvv.trim().length >= 3
    );
  }, [form]);

  const handleChange = (field: keyof CheckoutForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handlePlaceOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid || items.length === 0) {
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const generatedOrderId = `SLM-${Date.now().toString().slice(-6)}`;
    setOrderId(generatedOrderId);
    clearCart();
    setIsCompleted(true);
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-2">
              Finalizar compra
            </h1>
            <p className="text-muted-foreground">
              Completa tu compra de forma segura.
            </p>
          </div>

          {isCompleted ? (
            <section className="max-w-2xl mx-auto bg-card rounded-2xl border border-border/50 p-8 text-center">
              <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-4" />
              <h2 className="font-serif text-3xl text-foreground mb-3">
                Pedido confirmado
              </h2>
              <p className="text-muted-foreground mb-2">
                Gracias por tu compra. Hemos recibido tu pedido.
              </p>
              {orderId && (
                <p className="text-sm text-foreground mb-8">
                  Número de pedido: {orderId}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/products"
                  className="inline-flex justify-center px-6 py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 boty-transition"
                >
                  Seguir comprando
                </Link>
                <Link
                  href="/profile/orders"
                  className="inline-flex justify-center px-6 py-3 border border-border rounded-full text-sm font-medium hover:bg-muted boty-transition"
                >
                  Ver mis pedidos
                </Link>
              </div>
            </section>
          ) : items.length === 0 ? (
            <section className="max-w-2xl mx-auto bg-card rounded-2xl border border-border/50 p-8 text-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-serif text-3xl text-foreground mb-3">
                Tu carrito está vacío
              </h2>
              <p className="text-muted-foreground mb-8">
                Agrega productos al carrito antes de continuar.
              </p>
              <Link
                href="/products"
                className="inline-flex justify-center px-6 py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 boty-transition"
              >
                Ver productos
              </Link>
            </section>
          ) : (
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-12">
              <form
                onSubmit={handlePlaceOrder}
                className="bg-card rounded-2xl border border-border/50 p-6 md:p-8 space-y-8"
              >
                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-5">
                    Información de contacto
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nombre completo</Label>
                      <Input
                        id="fullName"
                        value={form.fullName}
                        onChange={(event) =>
                          handleChange("fullName", event.target.value)
                        }
                        placeholder="Nombre completo"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          handleChange("email", event.target.value)
                        }
                        placeholder="jane@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(event) =>
                          handleChange("phone", event.target.value)
                        }
                        placeholder="+52 55 0000 0000"
                        required
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-5">
                    Dirección de envío
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        value={form.address}
                        onChange={(event) =>
                          handleChange("address", event.target.value)
                        }
                        placeholder="Calle y número"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(event) =>
                          handleChange("city", event.target.value)
                        }
                        placeholder="Ciudad"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Código postal</Label>
                      <Input
                        id="postalCode"
                        value={form.postalCode}
                        onChange={(event) =>
                          handleChange("postalCode", event.target.value)
                        }
                        placeholder="10001"
                        required
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="notes">Notas de entrega (opcional)</Label>
                      <Textarea
                        id="notes"
                        value={form.notes}
                        onChange={(event) =>
                          handleChange("notes", event.target.value)
                        }
                        placeholder="Referencias, departamento, indicaciones..."
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="font-serif text-2xl text-foreground mb-5">
                    Datos de pago
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="cardName">Nombre del titular</Label>
                      <Input
                        id="cardName"
                        value={form.cardName}
                        onChange={(event) =>
                          handleChange("cardName", event.target.value)
                        }
                        placeholder="Nombre en la tarjeta"
                        required
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="cardNumber">Número de tarjeta</Label>
                      <Input
                        id="cardNumber"
                        inputMode="numeric"
                        value={form.cardNumber}
                        onChange={(event) =>
                          handleChange("cardNumber", event.target.value)
                        }
                        placeholder="0000 0000 0000 0000"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardExpiry">Vencimiento</Label>
                      <Input
                        id="cardExpiry"
                        value={form.cardExpiry}
                        onChange={(event) =>
                          handleChange("cardExpiry", event.target.value)
                        }
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardCvv">CVV</Label>
                      <Input
                        id="cardCvv"
                        inputMode="numeric"
                        value={form.cardCvv}
                        onChange={(event) =>
                          handleChange("cardCvv", event.target.value)
                        }
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </section>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-4 rounded-full text-sm font-medium hover:bg-primary/90 boty-transition disabled:opacity-60"
                >
                  {isSubmitting ? "Procesando pedido..." : "Realizar pedido"}
                </button>
              </form>

              <aside className="bg-card rounded-2xl border border-border/50 p-6 md:p-8 h-fit lg:sticky lg:top-28">
                <h2 className="font-serif text-2xl text-foreground mb-5">
                  Resumen del pedido
                </h2>

                <div className="space-y-4 pb-5 border-b border-border/50">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="text-muted-foreground">
                          Cant.: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-foreground">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-5 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>
                      Subtotal ({itemCount}{" "}
                      {itemCount === 1 ? "producto" : "productos"})
                    </span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Envío</span>
                    <span>
                      {shipping === 0 ? "Gratis" : formatCurrency(shipping)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Impuestos</span>
                    <span>{formatCurrency(taxes)}</span>
                  </div>
                  <div className="flex items-center justify-between text-base font-semibold text-foreground pt-3 border-t border-border/50">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

