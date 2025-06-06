import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Send, Heart } from "lucide-react";
import backgroundImage from "@assets/Wallpaper Cantik Iphone_1749120990697.jpeg";

interface GrievanceFormData {
  title: string;
  description: string;
  mood: string;
  severity: 'low' | 'medium' | 'high' | 'urgent' | '';
}

interface GrievanceFormPageProps {
  user: any;
}

export default function GrievanceFormPage({ user }: GrievanceFormPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<GrievanceFormData>({
    title: '',
    description: '',
    mood: '',
    severity: ''
  });
  
  const [selectedMoodData, setSelectedMoodData] = useState<{emoji: string, text: string} | null>(null);

  const moods = [
    { emoji: '😢', text: 'Sad' },
    { emoji: '😠', text: 'Angry' },
    { emoji: '😔', text: 'Disappointed' },
    { emoji: '😰', text: 'Anxious' },
    { emoji: '🤔', text: 'Confused' },
    { emoji: '😊', text: 'Happy' },
    { emoji: '😍', text: 'In Love' },
    { emoji: '🥰', text: 'Grateful' }
  ];

  const submitMutation = useMutation({
    mutationFn: async (data: GrievanceFormData) => {
      const response = await apiRequest('POST', '/api/grievances', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grievances'] });
      setLocation('/thank-you');
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit concern 💔",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  });

  const handleMoodSelect = (mood: {emoji: string, text: string}) => {
    setSelectedMoodData(mood);
    setFormData(prev => ({ 
      ...prev, 
      mood: `${mood.emoji} ${mood.text}` 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user?.role !== 'submitter') {
      toast({
        title: "Access denied",
        description: "Only Ayeshu can submit grievances! 💝",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.mood || !formData.severity) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate(formData);
  };

  const handleGoBack = () => {
    setLocation('/welcome');
  };

  if (user?.role !== 'submitter') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="card-gradient rounded-3xl shadow-2xl w-full max-w-md border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">🚫</div>
            <h1 className="font-poppins text-2xl font-bold text-foreground mb-4">
              Access Denied
            </h1>
            <p className="text-muted-foreground mb-6">
              Only Ayeshu can submit grievances! 💝
            </p>
            <Button onClick={handleGoBack} className="btn-gradient text-white font-bold py-3 px-6 rounded-2xl">
              Back to Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4 bg-cover bg-center bg-fixed"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="max-w-2xl mx-auto">
        <Card className="card-gradient rounded-3xl shadow-2xl border-primary/20">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <Button
                variant="ghost"
                onClick={handleGoBack}
                className="mb-4 text-muted-foreground hover:text-foreground flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </Button>
              <div className="text-5xl mb-4">💌</div>
              <h1 className="font-poppins text-3xl font-bold text-foreground mb-2">
                Share Your Heart
              </h1>
              <p className="text-muted-foreground">
                Tell Abdullah what's on your mind
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground font-semibold flex items-center gap-2">
                  <Heart size={16} />
                  What's the concern?
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Give your concern a title..."
                  className="rounded-2xl border-2 border-primary/30 bg-white/70 focus:border-primary text-foreground font-medium"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground font-semibold">
                  Tell me more
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what's on your heart..."
                  rows={4}
                  className="rounded-2xl border-2 border-primary/30 bg-white/70 focus:border-primary text-foreground font-medium resize-none"
                  required
                />
              </div>

              {/* Mood Selector */}
              <div className="space-y-3">
                <Label className="text-foreground font-semibold">
                  How are you feeling?
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {moods.map((mood) => (
                    <button
                      key={`${mood.emoji}-${mood.text}`}
                      type="button"
                      onClick={() => handleMoodSelect(mood)}
                      className={`mood-selector p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 text-center transition-all ${
                        selectedMoodData?.emoji === mood.emoji && selectedMoodData?.text === mood.text
                          ? 'border-primary bg-primary/20 selected'
                          : 'border-primary/30 bg-white/50 hover:bg-primary/10'
                      }`}
                    >
                      <div className="text-xl sm:text-2xl mb-1">{mood.emoji}</div>
                      <div className="text-xs sm:text-sm text-foreground font-medium">{mood.text}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div className="space-y-3">
                <Label className="text-foreground font-semibold">
                  How serious is this?
                </Label>
                <div className="grid gap-2 sm:gap-3">
                  {[
                    { value: 'low', emoji: '💚', text: 'Low - Just wanted to mention' },
                    { value: 'medium', emoji: '💛', text: 'Medium - This bothers me' },
                    { value: 'high', emoji: '💜', text: 'High - This really upsets me' },
                    { value: 'urgent', emoji: '❤️', text: 'Urgent - We need to talk NOW' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, severity: option.value as any }))}
                      className={`w-full min-h-[44px] text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all ${
                        formData.severity === option.value
                          ? 'border-primary bg-primary/10 shadow-lg'
                          : 'border-primary/20 bg-white/50 hover:border-primary/40 hover:bg-primary/5'
                      } flex items-center gap-2 sm:gap-3`}
                    >
                      <span className="text-lg sm:text-xl">{option.emoji}</span>
                      <span className="text-xs sm:text-sm font-medium text-foreground">{option.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoBack}
                  disabled={submitMutation.isPending}
                  className="flex-1 bg-secondary/50 text-foreground font-bold py-3 px-6 rounded-2xl hover:bg-secondary/80 transition-colors border-primary/30"
                >
                  <ArrowLeft className="mr-2" size={16} />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="flex-1 btn-gradient text-white font-bold py-3 px-6 rounded-2xl shadow-lg border-0"
                >
                  <Send className="mr-2" size={16} />
                  {submitMutation.isPending ? "Sending..." : "Send with Love"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
