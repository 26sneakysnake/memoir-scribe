import { useState, useEffect } from 'react';
import { User, CreditCard, History, Volume2, Download, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { userService, UserSettings } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: currentUser?.email || '',
    avatar: '',
    phoneNumber: ''
  });

  const [audioSettings, setAudioSettings] = useState({
    autoSave: true,
    highQuality: true,
    noiseReduction: false,
    autoTranscription: false
  });

  // Load user settings on component mount
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const settings = await userService.initializeUserIfNeeded(currentUser.uid, currentUser.email || '');
        
        setUserProfile({
          name: settings.name,
          email: currentUser.email || '',
          avatar: settings.avatar || '',
          phoneNumber: settings.phoneNumber
        });
        
        setAudioSettings(settings.audioSettings);
      } catch (error) {
        console.error('Error loading user settings:', error);
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserSettings();
  }, [currentUser, toast]);

  const handleProfileUpdate = async () => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      await userService.updateUserSettings(currentUser.uid, {
        name: userProfile.name,
        phoneNumber: userProfile.phoneNumber,
        avatar: userProfile.avatar,
      });
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAudioSettingsUpdate = async (setting: string, value: boolean) => {
    if (!currentUser) return;
    
    const newAudioSettings = { ...audioSettings, [setting]: value };
    setAudioSettings(newAudioSettings);
    
    try {
      await userService.updateUserSettings(currentUser.uid, {
        audioSettings: newAudioSettings
      });
      
      toast({
        title: "Settings updated",
        description: `${setting} has been ${value ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      console.error('Error updating audio settings:', error);
      // Revert the change on error
      setAudioSettings(audioSettings);
      toast({
        title: "Error",
        description: "Failed to update audio settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const subscriptionData = {
    plan: 'Free',
    status: 'active',
    nextBilling: '2024-02-15',
    price: '0€',
    features: [
      'Basic recordings',
      '1GB cloud storage',
      'Standard export',
      'Community support'
    ]
  };

  const historyData = [
    { id: '1', action: 'Profile updated', item: 'Personal information', date: new Date().toISOString(), time: new Date().toLocaleTimeString() },
    { id: '2', action: 'Settings changed', item: 'Audio preferences', date: new Date(Date.now() - 86400000).toISOString(), time: '4:45 PM' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 glass-card">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">Audio</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Subscription</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20 border-2 border-primary/20">
                    <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {userProfile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      Change photo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG up to 2MB
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={userProfile.phoneNumber}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" disabled={saving}>Cancel</Button>
                  <Button 
                    onClick={handleProfileUpdate} 
                    className="bg-primary hover:bg-primary/90"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Security Section */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Security
              </h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Change password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Two-factor authentication
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Audio Settings Tab */}
          <TabsContent value="audio" className="space-y-6">
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Recording Preferences</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto-save</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save your recordings
                    </p>
                  </div>
                  <Switch
                    checked={audioSettings.autoSave}
                    onCheckedChange={(checked) => handleAudioSettingsUpdate('autoSave', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>High definition quality</Label>
                    <p className="text-sm text-muted-foreground">
                      Record in 48kHz quality for better audio quality
                    </p>
                  </div>
                  <Switch
                    checked={audioSettings.highQuality}
                    onCheckedChange={(checked) => handleAudioSettingsUpdate('highQuality', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Noise reduction</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically remove background noise
                    </p>
                  </div>
                  <Switch
                    checked={audioSettings.noiseReduction}
                    onCheckedChange={(checked) => handleAudioSettingsUpdate('noiseReduction', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Automatic transcription</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically convert your recordings to text
                    </p>
                    <Badge variant="secondary" className="text-xs">Premium</Badge>
                  </div>
                  <Switch
                    checked={audioSettings.autoTranscription}
                    onCheckedChange={(checked) => handleAudioSettingsUpdate('autoTranscription', checked)}
                  />
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Export and sharing</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export all recordings
                </Button>
                <p className="text-sm text-muted-foreground">
                  Download a complete archive of your audio memories
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Current subscription</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold flex items-center">
                      Plan {subscriptionData.plan}
                      <Badge className="ml-2 bg-primary text-primary-foreground">
                        {subscriptionData.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Next billing: {formatDate(subscriptionData.nextBilling)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{subscriptionData.price}</p>
                    <p className="text-sm text-muted-foreground">/month</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h5 className="font-medium">Included features:</h5>
                  <ul className="space-y-1">
                    {subscriptionData.features.map((feature, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button variant="outline" className="flex-1">
                    Change plan
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Cancel subscription
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Billing history</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm">Jan 15, 2024</span>
                  <span className="text-sm font-medium">$9.99</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm">Dec 15, 2023</span>
                  <span className="text-sm font-medium">$9.99</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Nov 15, 2023</span>
                  <span className="text-sm font-medium">$9.99</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Recent activity</h3>
              <div className="space-y-3">
                {historyData.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/20 transition-smooth">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.item}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;