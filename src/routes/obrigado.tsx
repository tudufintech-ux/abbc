import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/obrigado")({
  component: ObrigadoPage,
});

function ObrigadoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0e3f4b] px-4 py-12 text-white">
      <section className="w-full max-w-md rounded-[18px] border border-white/15 bg-white/10 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-[#369977] text-white">
          <Check size={28} />
        </div>
        <h1 className="text-3xl font-bold">Obrigado pela doação</h1>
        <p className="mt-3 text-sm leading-6 text-white/78">
          Seu pagamento foi iniciado na Cielo. Se já concluiu a transação,
          a A.B.B.C. agradece sua contribuição.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-[#f3c373] px-5 text-sm font-extrabold text-[#3a2705]"
        >
          Voltar para a página inicial
        </Link>
      </section>
    </main>
  );
}
