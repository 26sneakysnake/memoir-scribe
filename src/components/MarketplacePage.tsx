import { useState, useEffect } from 'react';
import { Crown, Download, Heart, Play, Pause, Share2, Star, TrendingUp, Users, Clock, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { chaptersService } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';

interface PublishedStory {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar?: string;
  category: string;
  duration: number; // in minutes
  price: number;
  downloads: number;
  rating: number;
  tags: string[];
  coverImage?: string;
  audioUrl?: string;
  isPremium: boolean;
  publishedDate: string;
}

interface UserChapter {
  id: string;
  title: string;
  description: string;
  recordingsCount: number;
  totalDuration: number;
}

const MarketplacePage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [userChapters, setUserChapters] = useState<UserChapter[]>([]);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
  const [ownedStories, setOwnedStories] = useState<Set<string>>(new Set());
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [publishPrice, setPublishPrice] = useState<string>('4.99');

  // Exemples de stories publiées (gratuites pour démonstration)
  const featuredStories: PublishedStory[] = [
    {
      id: '1',
      title: 'Mémoires de Grand-mère',
      description: 'Les souvenirs touchants d\'une grand-mère française racontant son enfance pendant la guerre.',
      author: 'Marie Leclerc',
      authorAvatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop&crop=face',
      category: 'Histoire Familiale',
      duration: 45,
      price: 0,
      downloads: 1247,
      rating: 4.8,
      tags: ['Famille', 'Histoire', 'Guerre', 'Émotionnel'],
      isPremium: false,
      publishedDate: '2024-01-15',
      audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav'
    },
    {
      id: '2',
      title: 'Voyage en Provence',
      description: 'Récit captivant d\'un voyage culinaire à travers la Provence, avec anecdotes et recettes.',
      author: 'Pierre Dubois',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      category: 'Voyage',
      duration: 32,
      price: 0,
      downloads: 856,
      rating: 4.6,
      tags: ['Voyage', 'Cuisine', 'Provence', 'Culture'],
      isPremium: false,
      publishedDate: '2024-01-20',
      audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther30.wav'
    },
    {
      id: '3',
      title: 'Mon Premier Amour',
      description: 'Une histoire romantique touchante racontée avec humour et nostalgie.',
      author: 'Sophie Martin',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b372?w=100&h=100&fit=crop&crop=face',
      category: 'Romance',
      duration: 28,
      price: 0,
      downloads: 623,
      rating: 4.9,
      tags: ['Romance', 'Jeunesse', 'Humour', 'Nostalgie'],
      isPremium: false,
      publishedDate: '2024-01-25',
      audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand3.wav'
    },
    {
      id: '4',
      title: 'Secrets de Famille',
      description: 'Révélations surprenantes sur l\'histoire secrète d\'une famille bourgeoise parisienne.',
      author: 'Antoine Rousseau',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      category: 'Mystère',
      duration: 52,
      price: 0,
      downloads: 1089,
      rating: 4.7,
      tags: ['Mystère', 'Famille', 'Secrets', 'Paris'],
      isPremium: false,
      publishedDate: '2024-01-10',
      audioUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav'
    }
  ];

  // Charger les chapitres de l'utilisateur
  useEffect(() => {
    const loadUserChapters = async () => {
      if (!currentUser) return;
      
      try {
        const chapters = await chaptersService.getChapters(currentUser.uid);
        const userChapterData = chapters.map(chapter => ({
          id: chapter.id,
          title: chapter.title,
          description: chapter.description,
          recordingsCount: chapter.recordings.length,
          totalDuration: Math.round(chapter.recordings.reduce((sum, r) => sum + r.duration, 0) / 60)
        }));
        setUserChapters(userChapterData);
      } catch (error) {
        console.error('Error loading user chapters:', error);
      }
    };

    loadUserChapters();
  }, [currentUser]);

  const toggleAudioPlay = (storyId: string) => {
    const story = featuredStories.find(s => s.id === storyId);
    if (!story?.audioUrl) return;

    if (playingAudio === storyId && currentAudio) {
      // Arrêter la lecture
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setPlayingAudio(null);
      setCurrentAudio(null);
    } else {
      // Arrêter l'audio précédent s'il y en a un
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      // Démarrer la nouvelle lecture
      const audio = new Audio(story.audioUrl);
      audio.play().then(() => {
        setPlayingAudio(storyId);
        setCurrentAudio(audio);
        
        // Gérer la fin de lecture
        audio.onended = () => {
          setPlayingAudio(null);
          setCurrentAudio(null);
        };
        
        // Gérer les erreurs
        audio.onerror = () => {
          toast({
            title: "Erreur de lecture",
            description: "Impossible de lire ce fichier audio.",
            variant: "destructive",
          });
          setPlayingAudio(null);
          setCurrentAudio(null);
        };
      }).catch(() => {
        toast({
          title: "Erreur de lecture",
          description: "Impossible de lire ce fichier audio.",
          variant: "destructive",
        });
      });
    }
  };

  const toggleLike = (storyId: string) => {
    const newLiked = new Set(likedStories);
    if (newLiked.has(storyId)) {
      newLiked.delete(storyId);
      toast({
        title: "Retiré des favoris",
        description: "Cette histoire a été retirée de vos favoris.",
      });
    } else {
      newLiked.add(storyId);
      toast({
        title: "Ajouté aux favoris",
        description: "Cette histoire a été ajoutée à vos favoris.",
      });
    }
    setLikedStories(newLiked);
  };

  const handlePurchase = (story: PublishedStory) => {
    if (story.price === 0) {
      // Ajout gratuit à la bibliothèque
      const newOwned = new Set(ownedStories);
      newOwned.add(story.id);
      setOwnedStories(newOwned);
      
      toast({
        title: "Histoire ajoutée !",
        description: `"${story.title}" a été ajoutée à votre bibliothèque gratuitement.`,
      });
    } else {
      toast({
        title: "Achat simulé",
        description: `Vous avez acheté "${story.title}" pour ${story.price}€. Intégration Stripe à venir.`,
      });
    }
  };

  const handleShare = (story: PublishedStory) => {
    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: story.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "Le lien de cette histoire a été copié dans le presse-papiers.",
      });
    }
  };

  const handlePublishChapter = async () => {
    if (!selectedChapter) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un chapitre à publier.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Publication simulée",
      description: `Votre chapitre sera publié au prix de ${publishPrice}€. Fonctionnalité en développement.`,
    });
    setIsPublishDialogOpen(false);
    setSelectedChapter('');
    setPublishPrice('4.99');
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const renderStoryCard = (story: PublishedStory) => (
    <Card key={story.id} className="glass-card group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={story.authorAvatar} alt={story.author} />
              <AvatarFallback>{story.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg leading-tight">{story.title}</CardTitle>
              <p className="text-sm text-muted-foreground">par {story.author}</p>
            </div>
          </div>
          {story.isPremium && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {formatDuration(story.duration)}
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
            {story.rating}
          </div>
          <div className="flex items-center">
            <Download className="w-4 h-4 mr-1" />
            {story.downloads}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-sm leading-relaxed">
          {story.description}
        </CardDescription>

        <div className="flex flex-wrap gap-1">
          {story.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAudioPlay(story.id)}
              className="flex items-center space-x-1"
            >
              {playingAudio === story.id ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>Aperçu</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleLike(story.id)}
              className={likedStories.has(story.id) ? 'text-red-500' : ''}
            >
              <Heart className={`w-4 h-4 ${likedStories.has(story.id) ? 'fill-current' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShare(story)}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {story.price === 0 ? (
              <Badge variant="secondary" className="text-green-600 bg-green-50 border-green-200">
                Gratuit
              </Badge>
            ) : (
              <span className="text-lg font-bold text-primary">{story.price}€</span>
            )}
            <Button 
              onClick={() => handlePurchase(story)}
              className={`${ownedStories.has(story.id) 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-primary hover:bg-primary/90'
              }`}
              disabled={ownedStories.has(story.id)}
            >
              {ownedStories.has(story.id) ? 'Dans ma bibliothèque' : story.price === 0 ? 'Ajouter' : 'Acheter'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Marketplace des Mémoires
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Découvrez des histoires authentiques, partagez vos propres mémoires et connectez-vous avec une communauté passionnée.
        </p>
      </div>

      <Tabs defaultValue="explore" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 glass-card">
          <TabsTrigger value="explore" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Explorer</span>
          </TabsTrigger>
          <TabsTrigger value="publish" className="flex items-center space-x-2">
            <Share2 className="w-4 h-4" />
            <span>Publier</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Mes Ventes</span>
          </TabsTrigger>
        </TabsList>

        {/* Explorer Tab */}
        <TabsContent value="explore" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredStories.map(renderStoryCard)}
          </div>
        </TabsContent>

        {/* Publier Tab */}
        <TabsContent value="publish" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Share2 className="w-5 h-5" />
                <span>Publier vos Mémoires</span>
              </CardTitle>
              <CardDescription>
                Transformez vos enregistrements en histoires payantes et partagez-les avec la communauté.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {userChapters.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userChapters.map((chapter) => (
                      <Card key={chapter.id} className="border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">{chapter.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {chapter.description}
                          </p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                            <span>{chapter.recordingsCount} enregistrements</span>
                            <span>{formatDuration(chapter.totalDuration)}</span>
                          </div>
                          <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                className="w-full" 
                                onClick={() => setSelectedChapter(chapter.id)}
                              >
                                Publier ce chapitre
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-background border border-border">
                              <DialogHeader>
                                <DialogTitle>Publier "{chapter.title}"</DialogTitle>
                                <DialogDescription>
                                  Configurez les détails de publication de votre chapitre.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Prix de vente (€)</label>
                                  <Select value={publishPrice} onValueChange={setPublishPrice}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                                      <SelectItem value="2.99">2.99€</SelectItem>
                                      <SelectItem value="4.99">4.99€</SelectItem>
                                      <SelectItem value="7.99">7.99€</SelectItem>
                                      <SelectItem value="9.99">9.99€</SelectItem>
                                      <SelectItem value="12.99">12.99€</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Catégorie</label>
                                  <Select defaultValue="famille">
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                                      <SelectItem value="famille">Histoire Familiale</SelectItem>
                                      <SelectItem value="voyage">Voyage</SelectItem>
                                      <SelectItem value="romance">Romance</SelectItem>
                                      <SelectItem value="mystere">Mystère</SelectItem>
                                      <SelectItem value="aventure">Aventure</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Mots-clés (séparés par des virgules)</label>
                                  <Input placeholder="famille, nostalgie, émotionnel..." />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>
                                  Annuler
                                </Button>
                                <Button onClick={handlePublishChapter}>
                                  Publier maintenant
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="space-y-4">
                    <Volume2 className="w-16 h-16 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Aucun chapitre à publier</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Créez d'abord vos enregistrements et organisez-les en chapitres dans l'onglet "Stories" pour pouvoir les publier ici.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenus totaux</p>
                    <p className="text-2xl font-bold text-green-600">47.89€</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Téléchargements</p>
                    <p className="text-2xl font-bold text-blue-600">156</p>
                  </div>
                  <Download className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Note moyenne</p>
                    <p className="text-2xl font-bold text-yellow-600">4.7</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-600 fill-current" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Mes Publications</CardTitle>
              <CardDescription>
                Gérez vos histoires publiées et consultez leurs performances.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Share2 className="w-16 h-16 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold mt-4">Aucune publication pour le moment</h3>
                <p className="text-muted-foreground mt-2">
                  Vos histoires publiées apparaîtront ici avec leurs statistiques de vente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketplacePage;