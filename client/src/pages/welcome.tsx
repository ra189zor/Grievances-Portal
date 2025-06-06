import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  MessageCircle, 
  PlusCircle, 
  BarChart3, 
  LogOut, 
  Calendar,
  AlertTriangle,
  Smile
} from "lucide-react";
import { useState, useEffect } from "react";
import { registerPushNotifications } from "@/lib/pushNotifications";
import backgroundImage from "@assets/Wallpaper Cantik Iphone_1749120990697.jpeg";

interface WelcomePageProps {
  user: any;
  onLogout: () => void;
}

interface Grievance {
  id: number;
  title: string;
  description: string;
  mood: string;
  severity: 'low' | 'medium' | 'high' | 'urgent';
  submittedAt: string;
  submitterName: string;
  status: string;
}

export default function WelcomePage({ user, onLogout }: WelcomePageProps) {
  const [, setLocation] = useLocation();
  const [moodFilter, setMoodFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const { data: grievances = [], isLoading } = useQuery<Grievance[]>({
    queryKey: ['/api/grievances'],
  });

  const filteredGrievances = grievances.filter(grievance => {
    const moodMatch = moodFilter === "all" || grievance.mood.includes(moodFilter);
    const severityMatch = severityFilter === "all" || grievance.severity === severityFilter;
    return moodMatch && severityMatch;
  });

  const stats = {
    total: grievances.length,
    high: grievances.filter(g => g.severity === 'high' || g.severity === 'urgent').length,
    positive: grievances.filter(g => 
      g.mood.includes('😊') || g.mood.includes('😍') || g.mood.includes('🥰')
    ).length
  };

  const severityColors = {
    'low': 'bg-green-100 text-green-700 border-green-200',
    'medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'high': 'bg-purple-100 text-purple-700 border-purple-200',
    'urgent': 'bg-red-100 text-red-700 border-red-200'
  };

  const severityLabels = {
    'low': '💚 Low',
    'medium': '💛 Medium',
    'high': '💜 High',
    'urgent': '❤️ Urgent'
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (user?.role === 'viewer') { // Only request for Abdullah's account
      registerPushNotifications().catch(console.error);
    }
  }, [user]);

  return (
    <div 
      className="min-h-screen pb-safe bg-cover bg-center bg-fixed"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="container px-4 py-4 sm:py-8 mx-auto max-w-7xl space-y-6 sm:space-y-8">
        {/* Header Card */}
        <Card className="card-gradient">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Welcome, {user?.name} 🌸
                </h1>
                <p className="text-muted-foreground mt-1">
                  Share what's on your heart
                </p>
              </div>
              <Button
                onClick={onLogout}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground w-full sm:w-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Left Column - Submit Section */}
          <Card className="card-gradient">
            <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="text-primary w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                    Share Your Concerns
                  </h2>
                  <p className="text-muted-foreground">
                    Let me know what's on your heart
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => setLocation('/grievance-form')}
                className="w-full btn-gradient text-white font-semibold py-3 sm:py-6 rounded-xl sm:rounded-2xl"
              >
                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Submit New Concern
              </Button>
              
              <p className="text-center text-muted-foreground text-xs sm:text-sm">
                💫 Your feelings matter to me
              </p>
            </CardContent>
          </Card>

          {/* Right Column - Concerns List */}
          <Card className="bg-white/60 shadow-sm border-primary/10">
            <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                    Your Concerns
                  </h2>
                  <p className="text-muted-foreground">
                    {grievances.length} shared thoughts
                  </p>
                </div>
                {grievances.length === 0 && (
                  <div className="text-3xl sm:text-4xl">
                    💝
                  </div>
                )}
              </div>

              {grievances.length === 0 ? (
                <div className="text-center py-8 sm:py-12 space-y-4">
                  <p className="text-base sm:text-lg text-muted-foreground">
                    No concerns yet
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    All is well in paradise!
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {/* Your existing grievances list */}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
