/**
 * Login Page
 * Uses unified SignInPage component from @gkeferstein/design
 */

import { SignInPage } from '@gkeferstein/design';

export default function LoginPage() {
  return (
    <SignInPage
      appName="MOJO Campus"
      subtitle="Melde dich an, um auf deine Kurse zuzugreifen"
      routing="path"
      path="/login"
      signUpUrl="/register"
      forceRedirectUrl="/dashboard"
      logoSize="lg"
      logoMode="dark"
    />
  );
}
