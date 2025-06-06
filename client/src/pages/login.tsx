import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi, type LoginCredentials } from "@/lib/auth";
import { Heart, User, Lock } from "lucide-react";
import backgroundImage from "@assets/Wallpaper Cantik Iphone_1749120990697.jpeg";

interface LoginPageProps {
  onLogin: (user: any) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [, setLocation] = useLocation();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: ""
  });
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      onLogin(data.user);
      setLocation("/welcome");
      toast({
        title: "Welcome back! 💕",
        description: `Hello ${data.user.name}! Ready to connect hearts?`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed 💔",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Missing information",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(credentials);
  };

  

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-purple-500/20 to-pink-400/30 backdrop-blur-sm"></div>
      <Card className="card-gradient backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md border-primary/30 relative z-10">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="floating-heart text-6xl mb-4">💕</div>
            <h1 className="font-poppins text-3xl font-bold text-foreground mb-2">
              Pookie Portal
            </h1>
            <p className="text-muted-foreground font-medium">
              Our special space to share concerns 💝
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground font-semibold flex items-center gap-2">
                <User size={16} />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter your username"
                className="rounded-2xl border-2 border-primary/30 bg-white/70 focus:border-primary text-foreground font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-semibold flex items-center gap-2">
                <Lock size={16} />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
                className="rounded-2xl border-2 border-primary/30 bg-white/70 focus:border-primary text-foreground font-medium"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full btn-gradient text-white font-bold py-3 px-6 rounded-2xl shadow-lg border-0"
            >
              <Heart className="mr-2" size={16} />
              {loginMutation.isPending ? "Logging in..." : "Login with Love"}
            </Button>
          </form>

          
        </CardContent>
      </Card>
    </div>
  );
}
