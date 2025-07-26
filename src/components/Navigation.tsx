import { useState } from 'react';
import { Mic, BookOpen, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isRecording: boolean;
}

const Navigation = ({ activeTab, onTabChange, isRecording }: NavigationProps) => {
  const tabs = [
    { id: 'record', label: 'Enregistrement', icon: Mic },
    { id: 'chapters', label: 'Chapitres', icon: BookOpen },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <header className="glass-card border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-primary">
              <Mic className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Mémoires Audio
            </h1>
          </div>

          <nav className="flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isRecordTab = tab.id === 'record';
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg transition-smooth",
                    "hover:bg-accent/50",
                    isActive && "bg-primary/10 text-primary border border-primary/20",
                    isRecordTab && isRecording && "pulse-recording glow-primary"
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4",
                    isActive && "text-primary",
                    isRecordTab && isRecording && "text-primary"
                  )} />
                  <span className={cn(
                    "text-sm font-medium",
                    isActive && "text-primary",
                    isRecordTab && isRecording && "text-primary"
                  )}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            <div className="glass rounded-full p-2 cursor-pointer hover:bg-accent/20 transition-smooth">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;