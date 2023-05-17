const scrollToTop = () => {
  window.setTimeout(() => {
    window.scrollTo({
      top: Math.min(140, window.scrollY),
      left: 0,
      behavior: 'smooth',
    });
  }, 0);
};

export default scrollToTop;
