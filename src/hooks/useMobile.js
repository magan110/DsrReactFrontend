import { useState, useEffect } from 'react';

const getMobileDetect = () => {
  const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  
  const isAndroid = /Android/i.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  return {
    isAndroid,
    isIOS,
    isMobile,
    isDesktop: !isMobile,
  };
};

export const useMobile = () => {
  const [mobileDetect, setMobileDetect] = useState(getMobileDetect);

  useEffect(() => {
    const handleResize = () => {
      setMobileDetect(getMobileDetect());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return mobileDetect;
};

export default useMobile;