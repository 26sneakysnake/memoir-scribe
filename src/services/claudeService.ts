import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_API_KEY = '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';

const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true // Pour utilisation frontend uniquement
});

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
      
      const prompt = `
Tu es un auteur professionnel spécialisé dans la transformation de témoignages oraux en belles histoires structurées.

CONTEXTE DU CHAPITRE:
Titre: "${chapterTitle}"
Description: "${chapterDescription}"

TRANSCRIPTIONS À TRANSFORMER:
${transcriptions.map((t, i) => `\n--- Enregistrement ${i + 1} ---\n${t}`).join('\n')}

MISSION:
Transforme ces transcriptions en une belle histoire narrative et cohérente. 

INSTRUCTIONS:
1. Conserve tous les détails importants et émotions
2. Crée une structure narrative fluide avec introduction, développement et conclusion
3. Améliore le style littéraire tout en gardant l'authenticité de la voix
4. Corrige les répétitions et hésitations naturelles de l'oral
5. Organise chronologiquement si possible
6. Ajoute des transitions élégantes entre les différents segments

STYLE:
- Narratif et engageant
- Langue française soignée
- Préserve le ton personnel et émotionnel
- Accessible et captivant

Retourne ta réponse au format JSON avec:
{
  "title": "Un titre évocateur pour cette histoire",
  "story": "L'histoire complète transformée",
  "summary": "Un résumé en 2-3 phrases"
}
`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const response = message.content[0].type === 'text' ? message.content[0].text : '';
      
      // Parser la réponse JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Format de réponse invalide');
      }
      
      const result = JSON.parse(jsonMatch[0]);
      
      console.log('✅ Story generated successfully');
      return {
        transcriptions,
        story: result.story,
        title: result.title,
        summary: result.summary
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