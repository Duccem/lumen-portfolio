import { CartProvider } from "@/components/sections/store/cart/cart-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CartProvider>{children}</CartProvider>;
}
