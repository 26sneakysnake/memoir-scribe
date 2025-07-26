import { useState } from 'react';
import { Mic, BookOpen, Settings, User, Feather } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isRecording: boolean;
}

const Navigation = ({ activeTab, onTabChange, isRecording }: NavigationProps) => {
  const tabs = [
    { id: 'record', label: 'Recording', icon: Mic },
    { id: 'stories', label: 'Stories', icon: BookOpen },
    { id: 'publish', label: 'Publish', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="vintage-card border-b border-border/50 font-sans">
      <div className="container mx-auto px-4 py-3 md:py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="flex items-center space-x-2 md:space-x-3">
              <Feather className="w-6 h-6 md:w-8 md:h-8 text-primary drop-shadow-sm" strokeWidth={1.5} />
              <div className="flex flex-col">
                <h1 className="text-2xl md:text-3xl font-cursive font-bold text-primary drop-shadow-sm">
                  mémoire
                </h1>
                <span className="hidden md:block text-xs text-muted-foreground font-serif italic">preserving stories</span>
              </div>
            </div>
          </div>

          <nav className="flex items-center space-x-1 md:space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isRecordTab = tab.id === 'record';
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2 px-2 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl transition-organic relative overflow-hidden",
                    "hover:bg-primary/10 hover:shadow-vintage",
                    "border border-transparent hover:border-primary/20",
                    isActive && "bg-primary text-primary-foreground shadow-glow border-primary/30",
                    isRecordTab && isRecording && "vintage-pulse"
                  )}
                >
                  <div className="relative">
                    <Icon className={cn(
                      "w-4 h-4 transition-organic",
                      isActive && "text-primary-foreground",
                      !isActive && "text-muted-foreground",
                      isRecordTab && isRecording && "text-primary-foreground"
                    )} />
                  </div>
                  <span className={cn(
                    "text-xs md:text-sm font-medium transition-organic",
                    isActive && "text-primary-foreground",
                    !isActive && "text-muted-foreground",
                    isRecordTab && isRecording && "text-primary-foreground"
                  )}>
                    {tab.label}
                  </span>
                  {/* Vintage tab decoration */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent pointer-events-none rounded-lg md:rounded-xl"></div>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <div className="glass rounded-full p-3 cursor-pointer hover:bg-primary/10 transition-organic border border-primary/20">
              <User className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;