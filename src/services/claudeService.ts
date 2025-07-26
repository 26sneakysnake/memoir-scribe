import Anthropic from '@anthropic-ai/sdk';

// Clé API Claude - assure-toi qu'elle est valide
const CLAUDE_API_KEY = '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';

let anthropic: Anthropic;

try {
  anthropic = new Anthropic({
    apiKey: CLAUDE_API_KEY,
    dangerouslyAllowBrowser: true
  });
} catch (error) {
  console.error('❌ Erreur initialisation Claude:', error);
}

export interface StoryResult {
  transcriptions: string[];
  story: string;
  title: string;
  summary: string;
}

export const claudeService = {
  // Simulation de transcription (Claude n'a pas encore de support audio direct)
  transcribeAudio: async (audioBlob: Blob): Promise<string> => {
    try {
      console.log('🎤 Simulating audio transcription...');
      
      // Pour le moment, on retourne une transcription simulée
      // Dans une vraie implémentation, on utiliserait un service de transcription comme Whisper
      const simulatedTranscription = `
Voici le contenu transcrit de l'enregistrement audio. 
Cette transcription est simulée car Claude ne supporte pas encore l'audio directement.
Dans une vraie implémentation, vous devriez utiliser un service comme OpenAI Whisper 
ou Google Speech-to-Text pour transcrire l'audio avant de l'envoyer à Claude.

Durée de l'audio: ${Math.round(audioBlob.size / 1000)}KB
Type: ${audioBlob.type}

Contenu simulé: "Voici mes souvenirs d'enfance. Je me rappelle quand nous allions chez ma grand-mère..."
      `.trim();
      
      console.log('✅ Simulated transcription completed');
      return simulatedTranscription;
      
    } catch (error) {
      console.error('❌ Error transcribing audio:', error);
      throw new Error(`Échec de la transcription: ${error.message}`);
    }
  },

  // Génération d'histoire à partir des transcriptions
  generateStory: async (transcriptions: string[], chapterTitle: string, chapterDescription: string): Promise<StoryResult> => {
    try {
      console.log('📝 Generating story with Claude...');
      
      // Mode simulation pour tester le système
      console.log('🔧 Mode simulation activé (clé API à vérifier)');
      
      // Simuler une belle histoire basée sur les transcriptions
      const simulatedStory = {
        title: `Les Souvenirs de ${chapterTitle}`,
        story: `Il était une fois, dans les méandres de ma mémoire, des moments précieux qui résonnent encore aujourd'hui. 

${transcriptions.map((transcription, index) => {
  return `Cette histoire commence par ce souvenir vivace : "${transcription.substring(0, 100)}..." 

Chaque détail de cette époque reste gravé dans mon cœur. Les émotions d'alors, les visages aimés, les lieux familiers - tout cela forme une tapisserie de souvenirs qui raconte l'histoire de ma vie.`;
}).join('\n\n')}

Aujourd'hui, en revisitant ces moments à travers mes mots, je réalise combien ces expériences ont façonné qui je suis devenu. Chaque souvenir est un trésor, chaque émotion une leçon, chaque histoire un héritage pour les générations futures.

C'est ainsi que se termine ce chapitre de mes mémoires, mais l'histoire continue, riche de tous ces moments partagés et de l'amour qui les unit.`,
        summary: `Un récit touchant de souvenirs personnels centré sur ${chapterTitle}, transformant les témoignages oraux en une belle narration structurée qui capture l'essence émotionnelle des moments partagés.`
      };
      
      // Ajouter un délai pour simuler le traitement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ Simulated story generated successfully');
      return {
        transcriptions,
        story: simulatedStory.story,
        title: simulatedStory.title,
        summary: simulatedStory.summary
      };
      
    } catch (error) {
      console.error('❌ Error generating story:', error);
      throw new Error(`Échec de la génération d'histoire: ${error.message}`);
    }
  },

  // Processus complet: transcription + génération d'histoire
  processChapterAudios: async (audioUrls: string[], chapterTitle: string, chapterDescription: string): Promise<StoryResult> => {
    try {
      console.log('🎯 Starting complete audio processing...');
      console.log(`📁 Processing ${audioUrls.length} audio files for chapter: ${chapterTitle}`);
      
      // Télécharger et transcire tous les audios
      const transcriptions: string[] = [];
      
      for (let i = 0; i < audioUrls.length; i++) {
        console.log(`🎤 Processing audio ${i + 1}/${audioUrls.length}`);
        
        // Télécharger l'audio
        const response = await fetch(audioUrls[i]);
        if (!response.ok) {
          throw new Error(`Impossible de télécharger l'audio ${i + 1}`);
        }
        
        const audioBlob = await response.blob();
        
        // Transcire
        const transcription = await claudeService.transcribeAudio(audioBlob);
        transcriptions.push(transcription);
      }
      
      // Générer l'histoire
      console.log('📖 Generating story from transcriptions...');
      const storyResult = await claudeService.generateStory(transcriptions, chapterTitle, chapterDescription);
      
      console.log('✅ Complete processing finished');
      return storyResult;
      
    } catch (error) {
      console.error('❌ Error in complete processing:', error);
      throw error;
    }
  }
};