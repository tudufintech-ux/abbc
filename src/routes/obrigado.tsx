import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/obrigado")({
  component: ObrigadoPage,
});

function ObrigadoPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071f27] px-4 py-12 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(224,153,46,.22),transparent_34%),linear-gradient(135deg,#071f27_0%,#0e3f4b_52%,#082631_100%)]" />
      <section className="relative w-full max-w-lg rounded-[24px] border border-white/15 bg-white/[.09] p-8 text-center shadow-2xl backdrop-blur-md sm:p-10">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border border-[#f3c373]/30 bg-[#369977] text-white shadow-lg">
          <Check size={28} />
        </div>
        <p className="mb-3 text-xs font-extrabold uppercase tracking-[.2em] text-[#f3c373]">
          A.B.B.C agradece
        </p>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Sua doação ajuda a transformar vidas</h1>
        <p className="mt-4 text-sm leading-6 text-white/78 sm:text-base">
          Obrigado por apoiar a A.B.B.C. A confirmação do pagamento é processada
          pela Cielo e pode levar alguns instantes para ser concluída.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#f3c373] px-6 text-sm font-extrabold text-[#3a2705] shadow-lg shadow-black/20"
        >
          Voltar para a página inicial
        </Link>
      </section>
    </main>
  );
}
