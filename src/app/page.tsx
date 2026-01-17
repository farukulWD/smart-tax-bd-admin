import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="mb-8 flex flex-col items-center gap-4">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Smart Tax BD Admin Portal
        </h1>
      </div>
      <LoginForm />
    </div>
  );
}
