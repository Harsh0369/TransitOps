import { useState } from 'react';

// Example custom hook
export const useExample = () => {
  const [state, setState] = useState(false);
  const toggle = () => setState(prev => !prev);
  return { state, toggle };
};