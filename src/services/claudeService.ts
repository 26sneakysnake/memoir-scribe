import Anthropic from '@anthropic-ai/sdk';
import { TranscriptionService } from './transcriptionService';

// Gestion sécurisée de la clé API via localStorage
const getClaudeApiKey = (): string | null => {
  return localStorage.getItem('claude_api_key');
};

const setClaudeApiKey = (apiKey: string): void => {
  localStorage.setItem('claude_api_key', apiKey);
};

const createAnthropicClient = (): Anthropic | null => {
  const apiKey = getClaudeApiKey();
  if (!apiKey) return null;
  
  try {
    return new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  } catch (error) {
    console.error('❌ Erreur initialisation Claude:', error);
    return null;
  }
};

export interface StoryResult {
  transcriptions: string[];
  story: string;
  title: string;
  summary: string;
}

export interface TranscriptionResult {
  transcriptions: string[];
  isComplete: boolean;
}

export const claudeService = {
  // Configuration de la clé API
  setApiKey: (apiKey: string) => {
    setClaudeApiKey(apiKey);
  },

  hasApiKey: (): boolean => {
    return !!getClaudeApiKey();
  },
  // Transcription d'un fichier audio avec Whisper
  transcribeAudio: async (audioBlob: Blob): Promise<string> => {
    try {
      console.log('🎤 Starting real audio transcription...');
      
      // Utiliser le service de transcription Whisper
      const transcription = await TranscriptionService.transcribeAudio(audioBlob);
      
      console.log('✅ Real transcription completed');
      return transcription;
      
    } catch (error) {
      console.error('❌ Error transcribing audio:', error);
      console.warn('🔄 Falling back to simulated transcription...');
      
      // Fallback vers transcription simulée si erreur
      return `[Transcription simulée - Erreur: ${error.message}] \n\nVoici le contenu que devrait contenir l'audio...`;
    }
  },

  // Génération d'histoire à partir des transcriptions avec Claude
  generateStory: async (transcriptions: string[], chapterTitle: string, chapterDescription: string): Promise<StoryResult> => {
    const client = createAnthropicClient();
    if (!client) {
      throw new Error('Clé API Claude non configurée');
    }

    try {
      console.log('📝 Generating story with Claude...');
      
      const prompt = `Tu es un écrivain professionnel spécialisé dans la création de récits émouvants à partir de témoignages personnels.

Voici des transcriptions d'enregistrements audio sur le thème "${chapterTitle}":

${transcriptions.map((transcription, index) => `Enregistrement ${index + 1}:\n${transcription}`).join('\n\n')}

Contexte du chapitre: ${chapterDescription}

Transforme ces témoignages en une belle histoire narrative qui:
1. Respecte fidèlement le contenu et les émotions des témoignages
2. Structure le récit de manière fluide et engageante 
3. Préserve l'authenticité et l'intimité des souvenirs
4. Utilise un style littéraire beau et poétique
5. Capture l'essence émotionnelle des moments partagés

Réponds avec un JSON contenant:
- "title": Un titre poétique et évocateur pour cette histoire
- "story": Le récit complet transformé en belle narration
- "summary": Un résumé en 1-2 phrases de l'essence de cette histoire`;

      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      
      try {
        const result = JSON.parse(content);
        console.log('✅ Story generated with Claude successfully');
        
        return {
          transcriptions,
          story: result.story,
          title: result.title,
          summary: result.summary
        };
      } catch (parseError) {
        console.error('❌ Error parsing Claude response:', parseError);
        
        // Fallback: extraire manuellement les parties du texte
        const titleMatch = content.match(/"title":\s*"([^"]+)"/);
        const storyMatch = content.match(/"story":\s*"([^"]+)"/s);
        const summaryMatch = content.match(/"summary":\s*"([^"]+)"/);
        
        return {
          transcriptions,
          title: titleMatch?.[1] || `Les Souvenirs de ${chapterTitle}`,
          story: storyMatch?.[1] || content.replace(/[{}]/g, '').trim(),
          summary: summaryMatch?.[1] || `Un récit touchant de souvenirs personnels centré sur ${chapterTitle}.`
        };
      }
      
    } catch (error) {
      console.error('❌ Error generating story:', error);
      throw new Error(`Échec de la génération d'histoire: ${error.message}`);
    }
  },

  // Transcription seule des audios
  transcribeChapterAudios: async (audioUrls: string[]): Promise<TranscriptionResult> => {
    try {
      console.log('🎯 Starting audio transcription...');
      console.log(`📁 Processing ${audioUrls.length} audio files`);
      
      // Transcrire tous les audios avec Whisper
      console.log('🎤 Starting real transcription with Whisper...');
      const transcriptions = await TranscriptionService.transcribeMultipleAudios(audioUrls);
      
      console.log('✅ Transcription completed');
      return {
        transcriptions,
        isComplete: true
      };
      
    } catch (error) {
      console.error('❌ Error in transcription:', error);
      throw error;
    }
  },

  // Processus complet: transcription + génération d'histoire
  processChapterAudios: async (audioUrls: string[], chapterTitle: string, chapterDescription: string): Promise<StoryResult> => {
    try {
      console.log('🎯 Starting complete audio processing...');
      console.log(`📁 Processing ${audioUrls.length} audio files for chapter: ${chapterTitle}`);
      
      // Transcrire tous les audios avec Whisper
      console.log('🎤 Starting real transcription with Whisper...');
      const transcriptions = await TranscriptionService.transcribeMultipleAudios(audioUrls);
      
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