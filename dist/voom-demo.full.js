/**
 * Voom Animation Library v2
 * An optimized animation library for any website
 * Features:
 * - Responsive animations with mobile variants
 * - Error handling and cleanup
 * - Performance optimizations
 * - Support for both attribute and class-based animations
 */

// Cache selectors
const SELECTORS = {
  getAnimationElements: (type) => `[voomsh="${type}"], .voomsh-${type}`,
  replayButtons: '[voomsh="replay"], .voomsh-replay',
  buttons: '[voomsh="btn-1"], .voomsh-btn-1'
};

// Add mobile detection utility
const isMobile = () => window.innerWidth < 768;

// Add this function after SELECTORS definition
function setInitialState() {
  // Set initial opacity: 0 for all animated elements using native JavaScript
  Object.keys(animations).forEach(type => {
    document.querySelectorAll(SELECTORS.getAnimationElements(type))
      .forEach(element => {
        element.style.opacity = '0';
        element.style.visibility = 'visible';
        element.style.display = 'block'; // Ensure element is displayed
      });
  });
}

// Update animations with mobile variants
const animations = {
  'hdr-1': {
    desktop: {
      from: {
        x: 40,
        duration: 0.5,
        stagger: 0.03,
        opacity: 0,
        filter: 'blur(15px)',
        ease: "circ.out"
      },
      reset: {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)'
      }
    },
    mobile: {
      from: {
        x: 20,          // Reduced movement
        duration: 0.3,   // Faster animation
        stagger: 0.02,   // Faster stagger
        opacity: 0,
        filter: 'blur(4px)', // Reduced blur
        ease: "power1.out"  // Simpler easing
      },
      reset: {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)'
      }
    },
    setup: (element) => {
      const lines = new SplitType(element, { types: 'lines' });
      const chars = new SplitType(lines.lines, { types: 'chars' });
      return { lines, chars };
    },
    getTarget: (split) => split.chars.chars
  },
  'par-1': {
    desktop: {
      from: {
        x: 10,
        stagger: 0.05,
        duration: 0.3,
        opacity: 0,
        filter: 'blur(5px)',
        ease: "circ.out"
      },
      reset: {
        x: 0,
        opacity: 1,
        filter: 'blur(0px)'
      }
    },
    mobile: {
      from: {
        x: 5,           // Minimal movement
        stagger: 0.03,   // Faster stagger
        duration: 0.2,   // Faster animation
        opacity: 0,
        filter: 'blur(2px)', // Minimal blur
        ease: "power1.out"  // Simpler easing
      },
      reset: {
        x: 0,
        opacity: 1,
        filter: 'blur(0px)'
      }
    },
    setup: (element) => {
      const lines = new SplitType(element, { types: 'lines' });
      const words = new SplitType(lines.lines, { types: 'words' });
      return { lines, words };
    },
    getTarget: (split) => split.words.words
  }
};

// Update DEFAULTS with mobile-optimized ScrollTrigger
const DEFAULTS = {
  scrollTrigger: {
    start: "top 90%",
    end: "bottom 10%",
    toggleActions: "play none none none",
    markers: false,
    // Mobile optimization flags
    fastScrollEnd: true,
    preventOverlaps: true
  },
  buttonAnimations: {
    hover: {
      enter: (padding) => ({
        paddingLeft: padding.left * 1.2,
        paddingRight: padding.right * 1.2,
        scale: 1.05,
        duration: 0.3,
        ease: "back.out(3)"
      }),
      leave: (padding) => ({
        paddingLeft: padding.left,
        paddingRight: padding.right,
        scale: 1,
        duration: 0.3,
        ease: "back.out(1)"
      })
    },
    click: {
      down: {
        scale: 1,
        filter: 'blur(4px)',
        duration: 0.1,
        ease: "power2.out"
      },
      up: {
        scale: 1.05,
        filter: 'blur(0px)',
        duration: 0.1,
        ease: "power2.out"
      }
    }
  }
};

// Store instances
const instances = new Map();
window.voomInstances = instances;

// Load dependencies
const loadDependencies = async () => {
  try {
    await Promise.all([
      loadScript('https://unpkg.com/split-type'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js')
    ]);
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js');
    gsap.registerPlugin(ScrollTrigger);
    
    // Initialize animations after dependencies are loaded
    if (window.Webflow) {
      window.Webflow ||= [];
      window.Webflow.push(initializeAnimations);
    } else {
      initializeAnimations();
    }
    
    return true;
  } catch (error) {
    console.error('Failed to load dependencies:', error);
    return false;
  }
};

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function cleanup() {
  instances.forEach(instance => {
    if (instance.split.chars) instance.split.chars.revert();
    if (instance.split.lines) instance.split.lines.revert();
    if (instance.split.revert) instance.split.revert();
  });
  instances.clear();
}

function applyAnimation(element, animConfig) {
  try {
    const split = animConfig.setup(element);
    const target = animConfig.getTarget(split);
    return { split, target };
  } catch (error) {
    console.error('Error applying animation:', error);
    return null;
  }
}

function applyTrigger(element, animConfig) {
  const result = applyAnimation(element, animConfig);
  if (!result) return;

  const { split, target } = result;
  const variant = isMobile() ? 'mobile' : 'desktop';
  const config = animConfig[variant];
  
  instances.set(element, { split, target, config });

  // Set initial state for the parent element
  gsap.set(element, { opacity: 1 });

  const scrollAnimation = {
    ...config.from,
    scrollTrigger: {
      ...DEFAULTS.scrollTrigger,
      trigger: element,
      once: true,
      onEnter: () => {
        // Ensure element is visible when animation starts
        gsap.set(element, { opacity: 1 });
      }
    }
  };

  gsap.from(target, scrollAnimation);
}

// Update button initialization for mobile
function initializeButton(button) {
  const computedStyle = window.getComputedStyle(button);
  const padding = {
    left: parseFloat(computedStyle.paddingLeft),
    right: parseFloat(computedStyle.paddingRight)
  };

  gsap.set(button, { opacity: 1 });

  // Only add hover effects on desktop
  if (!isMobile()) {
    button.addEventListener('mouseenter', () => {
      gsap.to(button, DEFAULTS.buttonAnimations.hover.enter(padding));
    });

    button.addEventListener('mouseleave', () => {
      gsap.to(button, DEFAULTS.buttonAnimations.hover.leave(padding));
    });
  }

  // Simplified click animation for mobile
  button.addEventListener('mousedown', () => {
    gsap.to(button, {
      scale: 0.95,
      duration: 0.1,
      ease: "power1.out"
    });
  });

  button.addEventListener('mouseup', () => {
    gsap.to(button, {
      scale: 1,
      duration: 0.1,
      ease: "power1.out"
    });
  });
}

// Update initialization function to include buttons
function initializeAnimations() {
  cleanup();
  
  // Initialize animations
  Object.entries(animations).forEach(([type, config]) => {
    document.querySelectorAll(SELECTORS.getAnimationElements(type))
      .forEach(element => applyTrigger(element, config));
  });

  // Initialize buttons
  document.querySelectorAll(SELECTORS.buttons)
    .forEach(initializeButton);
}

// Initialize
setInitialState(); // Set initial state immediately
loadDependencies(); // Load dependencies and initialize animations 