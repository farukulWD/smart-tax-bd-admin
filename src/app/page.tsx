import { LoginForm } from "@/components/auth/login-form";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background px-4 py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-primary/10 to-transparent" />
      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="space-y-3 text-center">
          <Badge variant="outline" className="gap-2 px-3 py-1 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Secure Admin Access
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Smart Tax BD Admin Portal</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage users, orders, files, and tax service settings.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
