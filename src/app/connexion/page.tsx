import { Suspense } from "react";
import { redirect } from "next/navigation";
import FormulaireConnexion from "@/components/FormulaireConnexion";
import { creerClientServeur } from "@/lib/supabase/server";

export default function Connexion({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; erreur?: string }>;
}) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-md p-8">Chargement…</main>}>
      <ContenuConnexion searchParams={searchParams} />
    </Suspense>
  );
}

async function ContenuConnexion({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; erreur?: string }>;
}) {
  const { code, erreur } = await searchParams;
  const supabase = await creerClientServeur();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      redirect("/");
    }

    console.error("Échec de l'échange du code de connexion sur /connexion :", error);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-3xl font-bold">Connexion</h1>
      <p className="mt-2 text-gray-600">
        Saisissez votre adresse e-mail : vous recevrez un lien pour vous connecter, sans
        mot de passe.
      </p>
      <FormulaireConnexion erreurLien={erreur === "lien-invalide" || Boolean(code)} />
    </main>
  );
}
