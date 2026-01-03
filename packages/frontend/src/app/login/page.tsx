/**
 * Login Page
 * Uses unified SignInPage component from @gkeferstein/design
 */

"use client";

import { SignInPage } from '@gkeferstein/design';
import { useSearchParams } from 'next/navigation';

function pickFirst(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getRedirectUrl(searchParams: URLSearchParams | null): string | undefined {
  if (!searchParams) return undefined;
  
  // Clerk uses `redirect_url`, but we support both spellings defensively.
  const redirectUrl = searchParams.get('redirect_url') || searchParams.get('redirectUrl');
  return redirectUrl ? pickFirst(redirectUrl) : undefined;
}

export default function LoginPage() {
  const searchParams = useSearchParams();
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
