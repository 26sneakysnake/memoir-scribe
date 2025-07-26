import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

export interface UserSettings {
  name: string;
  phoneNumber: string;
  countryCode: string;
  avatar?: string;
  audioSettings: {
    autoSave: boolean;
    highQuality: boolean;
    noiseReduction: boolean;
    autoTranscription: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export const userService = {
  // Get user settings
  getUserSettings: async (userId: string): Promise<UserSettings | null> => {
    try {
      console.log('🔍 Getting user settings for:', userId);
      const userRef = doc(db, 'users', userId, 'settings', 'profile');
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        console.log('✅ User settings found');
        return userSnap.data() as UserSettings;
      } else {
        console.log('⚠️ No user settings found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting user settings:', error);
      throw error;
    }
  },

  // Create initial user settings
  createUserSettings: async (userId: string, email: string, initialData?: Partial<UserSettings>): Promise<void> => {
    try {
      console.log('🔧 Creating user settings for:', userId);
      const userRef = doc(db, 'users', userId, 'settings', 'profile');
      
      const defaultSettings: UserSettings = {
        name: initialData?.name || email.split('@')[0], // Use email prefix as default name
        phoneNumber: initialData?.phoneNumber || '',
        countryCode: initialData?.countryCode || '+33', // Default to France
        avatar: initialData?.avatar || '',
        audioSettings: {
          autoSave: true,
          highQuality: true,
          noiseReduction: false,
          autoTranscription: false,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...initialData,
      };

      await setDoc(userRef, defaultSettings);
      console.log('✅ User settings created successfully');
    } catch (error) {
      console.error('❌ Error creating user settings:', error);
      throw error;
    }
  },

  // Update user settings
  updateUserSettings: async (userId: string, updates: Partial<UserSettings>): Promise<void> => {
    try {
      console.log('📝 Updating user settings for:', userId);
      const userRef = doc(db, 'users', userId, 'settings', 'profile');
      
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      
      console.log('✅ User settings updated successfully');
    } catch (error) {
      console.error('❌ Error updating user settings:', error);
      throw error;
    }
  },

  // Upload avatar image
  uploadAvatar: async (userId: string, file: File): Promise<string> => {
    try {
      console.log('📤 Uploading avatar for user:', userId);
      const fileExtension = file.name.split('.').pop();
      const fileName = `avatar_${Date.now()}.${fileExtension}`;
      const storagePath = `users/${userId}/avatar/${fileName}`;
      
      const avatarRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(avatarRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('✅ Avatar uploaded successfully');
      return downloadURL;
    } catch (error) {
      console.error('❌ Error uploading avatar:', error);
      throw error;
    }
  },

  // Initialize user settings if they don't exist
  initializeUserIfNeeded: async (userId: string, email: string): Promise<UserSettings> => {
    try {
      let settings = await userService.getUserSettings(userId);
      
      if (!settings) {
        await userService.createUserSettings(userId, email);
        settings = await userService.getUserSettings(userId);
      }
      
      return settings!;
    } catch (error) {
      console.error('❌ Error initializing user:', error);
      throw error;
    }
  },
};