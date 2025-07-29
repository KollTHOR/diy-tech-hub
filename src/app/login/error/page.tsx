import { Suspense } from "react";
import LoginErrorContent from "./login-error-content"; // Move your current component logic here

export default function LoginErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginErrorContent />
    </Suspense>
  );
}
