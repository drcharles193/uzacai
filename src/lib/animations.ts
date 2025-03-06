
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

export const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: custom * 0.1
    }
  })
};

export const scaleVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      delay: custom * 0.1
    }
  })
};

export const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Animation for a subtle hover effect
export const subtleHoverEffect = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget;
  const { left, top, width, height } = el.getBoundingClientRect();
  const x = (e.clientX - left) / width;
  const y = (e.clientY - top) / height;
  
  el.style.setProperty('--hover-x', x.toFixed(2));
  el.style.setProperty('--hover-y', y.toFixed(2));
  el.style.setProperty('--hover-opacity', '1');
};

// Animation for hover exit
export const resetHoverEffect = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget;
  el.style.setProperty('--hover-opacity', '0');
};
