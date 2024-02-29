import { useState, useEffect } from 'react';

type WindowSize = {
    width: number;
    height: number;
    };

function useWindowSize(): WindowSize {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  return size;
}

export default useWindowSize;