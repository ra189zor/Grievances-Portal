import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Plus, Smartphone } from "lucide-react";
import backgroundImage from "@assets/Wallpaper Cantik Iphone_1749120990697.jpeg";

export default function ThankYouPage() {
  const [, setLocation] = useLocation();

  const handleBackToDashboard = () => {
    setLocation('/welcome');
  };

  const handleSubmitAnother = () => {
    setLocation('/grievance-form');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-fixed"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backgroundBlendMode: 'overlay'
      }}
    >
      <Card className="card-gradient rounded-3xl shadow-2xl w-full max-w-md border-primary/20">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-6 floating-heart">💖</div>
          <h1 className="font-poppins text-3xl font-bold text-foreground mb-4">
            Message Sent!
          </h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Your heart has been heard! Abdullah will receive your message with love and care. 
            Communication is the key to a beautiful relationship. 💕
          </p>
          
          {/* Notification status */}
          <div className="space-y-3 mb-6">
            <div className="bg-destructive/10 rounded-2xl p-4 border border-destructive/20">
              <div className="flex items-center justify-center gap-2 text-destructive">
                <Smartphone size={20} />
                <span className="text-sm font-medium">Telegram notification sent!</span>
              </div>
            </div>
            <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
              <div className="flex items-center justify-center gap-2 text-primary">
                <div className="text-lg">📧</div>
                <span className="text-sm font-medium">Email notification sent!</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleBackToDashboard}
              className="w-full btn-gradient text-white font-bold py-3 px-6 rounded-2xl shadow-lg border-0"
            >
              <Home className="mr-2" size={16} />
              Back to Dashboard
            </Button>
            <Button
              onClick={handleSubmitAnother}
              variant="outline"
              className="w-full bg-secondary/50 text-foreground font-bold py-3 px-6 rounded-2xl hover:bg-secondary/80 transition-colors border-primary/30"
            >
              <Plus className="mr-2" size={16} />
              Send Another Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
