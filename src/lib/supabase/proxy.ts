import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const CHEMINS_PUBLICS = ["/connexion", "/auth", "/api"];

export async function mettreAJourSession(request: NextRequest) {
  // Si Supabase renvoie le code de connexion à la page par défaut, transfère-le
  // au callback qui peut l'échanger et écrire la session dans les cookies.
  if (
    request.nextUrl.pathname === "/connexion" &&
    request.nextUrl.searchParams.has("code")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  let reponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesAEcrire) {
          cookiesAEcrire.forEach(({ name, value }) => request.cookies.set(name, value));
          reponse = NextResponse.next({ request });
          cookiesAEcrire.forEach(({ name, value, options }) =>
            reponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Vérifie le jeton auprès de Supabase et le rafraîchit si nécessaire
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const chemin = request.nextUrl.pathname;
  const cheminPublic = CHEMINS_PUBLICS.some((prefixe) => chemin.startsWith(prefixe));

  if (!user && !cheminPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    return NextResponse.redirect(url);
  }

  return reponse;
}
