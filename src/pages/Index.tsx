import { useState } from 'react';
import Navigation from '@/components/Navigation';
import RecordingPage from '@/components/RecordingPage';
import StoriesPage from '@/components/StoriesPage';
import MarketplacePage from '@/components/MarketplacePage';
import SettingsPage from '@/components/SettingsPage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('record');
  const [isRecording, setIsRecording] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'record':
        return <RecordingPage onRecordingStateChange={setIsRecording} />;
      case 'stories':
        return <StoriesPage />;
      case 'publish':
        return <MarketplacePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <RecordingPage onRecordingStateChange={setIsRecording} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isRecording={isRecording}
      />
      <main className="pb-8">
        {renderActiveTab()}
      </main>
    </div>
  );
};

export default Index;
