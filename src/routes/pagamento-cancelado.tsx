import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/pagamento-cancelado")({
  component: PagamentoCanceladoPage,
});

function PagamentoCanceladoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0e3f4b] px-4 py-12 text-white">
      <section className="w-full max-w-md rounded-[18px] border border-white/15 bg-white/10 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-[#c94545] text-white">
          <AlertCircle size={28} />
        </div>
        <h1 className="text-3xl font-bold">Pagamento não concluído</h1>
        <p className="mt-3 text-sm leading-6 text-white/78">
          Não foi possível concluir o pagamento agora. Você pode tentar novamente
          ou escolher Pix, TED, DOC ou invoice.
        </p>
        <Link
          to="/"
          hash="doar"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-[#f3c373] px-5 text-sm font-extrabold text-[#3a2705]"
        >
          Escolher outra forma de pagamento
        </Link>
      </section>
    </main>
  );
}
