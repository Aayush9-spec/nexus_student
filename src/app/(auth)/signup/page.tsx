import { SignupForm } from "./SignupForm";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <SignupForm />
    </div>
  );
}
