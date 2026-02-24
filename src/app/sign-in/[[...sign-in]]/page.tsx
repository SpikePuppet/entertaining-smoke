import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-100 flex items-center justify-center gap-2"><span>🥋</span> Exciting Smoke</h1>
          <p className="mt-1 text-zinc-400">BJJ Training Journal</p>
        </div>
        <SignIn
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
          appearance={{
            baseTheme: dark,
            variables: {
              colorBackground: "#18181b",
              colorInputBackground: "#09090b",
              colorPrimary: "#e4e4e7",
              colorText: "#ffffff",
              colorNeutral: "#52525b",
              borderRadius: "0.5rem",
              fontFamily: "var(--font-geist-sans)",
            },
            elements: {
              card: "border border-zinc-800 shadow-none",
              formButtonPrimary:
                "bg-zinc-100 text-zinc-900 hover:bg-white",
            },
          }}
        />
      </div>
    </div>
  );
}
