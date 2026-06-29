import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateUser } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Code2, UserPlus } from "lucide-react";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useCreateUser();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    registerMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          // Auto login after registration
          localStorage.setItem("codenexus_user", JSON.stringify(data));
          toast({ title: "Account created", description: "Welcome to CodeNexus." });
          setLocation("/problems");
        },
        onError: (error: any) => {
          toast({ 
            title: "Registration failed", 
            description: error.response?.data?.message || "Could not create account",
            variant: "destructive"
          });
        },
      }
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            <Code2 size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Request Access</h1>
          <p className="text-muted-foreground mt-2">Create your CodeNexus profile</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} className="bg-background" data-testid="input-username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} className="bg-background" data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Create a password" {...field} className="bg-background" data-testid="input-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full mt-6 gap-2" disabled={registerMutation.isPending} data-testid="button-submit">
                {registerMutation.isPending ? "Creating Profile..." : "Register Profile"}
                {!registerMutation.isPending && <UserPlus size={16} />}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have access? </span>
            <Link href="/login" className="text-primary hover:underline font-medium" data-testid="link-login">
              Authenticate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}