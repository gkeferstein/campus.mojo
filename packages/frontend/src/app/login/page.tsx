/**
 * Login Page
 * Uses unified SignInPage component from @gkeferstein/design
 */

import { SignInPage } from '@gkeferstein/design';

type SearchParams = Record<string, string | string[] | undefined>;

function pickFirst(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getRedirectUrl(searchParams?: SearchParams): string | undefined {
  // Clerk uses `redirect_url`, but we support both spellings defensively.
  return (
    pickFirst(searchParams?.redirect_url) ??
    pickFirst(searchParams?.redirectUrl)
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const redirectUrl = getRedirectUrl(searchParams);
  const signUpUrl = redirectUrl
    ? `/register?redirect_url=${encodeURIComponent(redirectUrl)}`
    : "/register";

  return (
    <SignInPage
      appName="MOJO Campus"
      subtitle="Melde dich an, um auf deine Kurse zuzugreifen"
      routing="path"
      path="/login"
      signUpUrl={signUpUrl}
      logoSize="lg"
      logoMode="dark"
    />
  );
}
