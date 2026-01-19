// components/ui/tabs.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

interface TabsProps {
  value?: string;
  onValueChange?: (tab: string) => void;
  children: ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children, className }) => {
  const [internalValue, setInternalValue] = useState(value || "");
  
  const setActiveTab = (tab: string) => {
    setInternalValue(tab);
    if (onValueChange) onValueChange(tab);
  };

  return (
    <TabsContext.Provider value={{ activeTab: internalValue, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: ReactNode;
  className?: string;
}
export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}
export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within a Tabs");

  const isActive = context.activeTab === value;

  return (
    <button
      type="button"
      onClick={() => context.setActiveTab(value)}
      className={`${className} ${isActive ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"} transition-colors duration-200`}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}
export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within a Tabs");

  if (context.activeTab !== value) return null;

  return <div className={className}>{children}</div>;
};
