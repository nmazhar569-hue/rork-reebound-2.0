import { useState } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { AppMode, modeColors } from '@/constants/modeColors';

export const [AppModeProvider, useAppMode] = createContextHook(() => {
  const [currentMode, setCurrentMode] = useState<AppMode>('workout');

  const theme = modeColors[currentMode];

  return {
    currentMode,
    setCurrentMode,
    theme,
  };
});
