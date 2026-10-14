import { SignIn, SignUp } from "@clerk/clerk-react";

import { HeaderBar } from "../components/header/HeaderBar";

export function SignInPage() {
  return (
    <>
      <HeaderBar showLogin={false} />
      <main className="px-4 pt-24 pb-8">
        <div className="mx-auto flex w-full max-w-7xl justify-center">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/"
          />
        </div>
      </main>
    </>
  );
}

export function SignUpPage() {
  return (
    <>
      <HeaderBar showLogin={false} />
      <main className="px-4 pt-24 pb-8">
        <div className="mx-auto flex w-full max-w-7xl justify-center">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/"
          />
        </div>
      </main>
    </>
  );
}
