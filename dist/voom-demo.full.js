/**
 * Voom Animation Library v2
 * An optimized animation library for any website
 * Features:
 * - Responsive animations with mobile variants
 * - Error handling and cleanup
 * - Performance optimizations
 * - Support for both attribute and class-based animations
 */

// Cache selectors for better performance and maintainability
const SELECTORS = {
  // Get elements by both attribute and class (e.g., [voomsh="hdr-1"] or .voomsh-hdr-1)
  getAnimationElements: (type) => `[voomsh="${type}"], .voomsh-${type}`,
  replayButtons: '[voomsh="replay"], .voomsh-replay',
  buttons: '[voomsh="btn-1"], .voomsh-btn-1'
};

// Default configuration values
const DEFAULTS = {
  // ScrollTrigger default settings
  scrollTrigger: {
    start: "top 90%",    // Start animation when element's top reaches 90% of viewport
    end: "bottom 10%",   // End animation when element's bottom reaches 10% of viewport
    toggleActions: "play none none reverse", // Play forward when entering, reverse when leaving
    markers: false       // Debug markers (set to true for development)
  },
  // Add skipAnimation flag for resize handling
  skipAnimation: false,
  // Button animation presets
  buttonAnimations: {
    hover: {
      // Scale and padding animation on hover
      enter: (padding) => ({
        paddingLeft: padding.left * 1.2,
        paddingRight: padding.right * 1.2,
        scale: 1.05,
        duration: 0.3,
        ease: "back.out(3)"
      }),
      // Reset to original state
      leave: (padding) => ({
        paddingLeft: padding.left,
        paddingRight: padding.right,
        scale: 1,
        duration: 0.3,
        ease: "back.out(1)"
      })
    },
    // Click animation states
    click: {
      down: {
        scale: 1,
        filter: 'blur(4px)',  // Add blur on click
        duration: 0.1,
        ease: "power2.out"
      },
      up: {
        scale: 1.05,
        filter: 'blur(0px)',  // Remove blur when released
        duration: 0.1,
        ease: "power2.out"
      }
    }
  }
};

// Animation definitions with responsive variants
const animations = {
  'hdr-1': {
    variants: {
      default: {
        from: {
          x: 40,
          duration: 0.5,
          stagger: 0.03,   // Faster stagger for characters
          opacity: 0,
          filter: 'blur(15px)',  // Add stronger blur for header
          ease: "circ.out"
        },
        reset: {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)'    // Clear blur in final state
        }
      },
    },
    // First split into lines, then split each line into characters
    setup: (element) => {
      const lines = new SplitType(element, { types: 'lines' });
      // Split each line into characters
      const chars = new SplitType(lines.lines, { types: 'chars' });
      return { lines, chars };
    },
    // Return all characters from all lines
    getTarget: (split) => split.chars.chars
  },
  'par-1': {
    variants: {
      default: {
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
      }
    },
    // Split into lines first, then words
    setup: (element) => {
      const lines = new SplitType(element, { types: 'lines' });
      const words = new SplitType(lines.lines, { types: 'words' });
      return { lines, words };
    },
    // Target the words within lines
    getTarget: (split) => split.words.words
  }
};

// Store animation instances for cleanup and replay functionality
const instances = new Map();

/**
 * Load required external dependencies
 * Returns Promise<boolean> indicating success/failure
 */
const loadDependencies = async () => {
  try {
    // Load SplitType and GSAP in parallel
    await Promise.all([
      loadScript('https://unpkg.com/split-type'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js')
    ]);
    // Load ScrollTrigger after GSAP
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js');
    gsap.registerPlugin(ScrollTrigger);
    return true;
  } catch (error) {
    console.error('Failed to load Voom dependencies:', error);
    return false;
  }
};

/**
 * Helper function to load external scripts
 * Returns Promise that resolves when script is loaded
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

/**
 * Cleanup function to remove split text instances
 * Called on resize and before reinitializing animations
 */
function cleanup() {
  instances.forEach(instance => {
    // For nested splits (like in hdr-1), revert chars first, then lines
    if (instance.split.chars) {
      instance.split.chars.revert();
    }
    if (instance.split.lines) {
      instance.split.lines.revert();
    }
    // For single splits (like in par-1)
    if (instance.split.revert) {
      instance.split.revert();
    }
  });
  instances.clear();
}

/**
 * Debounce helper to limit function calls
 * Used for resize handling to prevent excessive recalculations
 */
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Apply animation with error handling
 * Returns null if animation setup fails
 */
function applyAnimation(element, animConfig) {
  try {
    const split = animConfig.setup(element);
    if (!split) {
      console.warn('Split operation failed for element:', element);
      return null;
    }
    const target = animConfig.getTarget(split);
    return { split, target };
  } catch (error) {
    console.error('Error applying animation:', error);
    return null;
  }
}

/**
 * Enhanced trigger handler with responsive variants
 * Handles scroll, hover, and click triggers
 */
function applyTrigger(element, animConfig, skipAnimation = false) {
  const result = applyAnimation(element, animConfig);
  if (!result) return;

  const { split, target } = result;
  // Check both attribute and data-attribute for trigger type
  const triggerType = element.getAttribute('voomtrigger') || 
                     element.getAttribute('data-voomtrigger') || 
                     'scroll';
  // Select animation variant based on screen width
  const variant = window.innerWidth < 768 ? 'mobile' : 'default';
  const config = animConfig.variants[variant] || animConfig.variants.default;
  
  instances.set(element, { split, target, config });

  switch(triggerType) {
    case 'hover':
      gsap.set(target, config.reset);
      element.addEventListener('mouseenter', () => {
        gsap.from(target, config.from);
      });
      break;
    
    case 'click':
      gsap.set(target, config.reset);
      element.addEventListener('click', () => {
        gsap.from(target, config.from);
      });
      break;
    
    default: // 'scroll'
      const scrollAnimation = { 
        ...config.from, 
        scrollTrigger: { ...DEFAULTS.scrollTrigger, trigger: element }
      };
      
      // If skipAnimation is true, just set the final state
      if (skipAnimation) {
        gsap.set(target, config.reset);
      } else {
        gsap.from(target, scrollAnimation);
      }
  }
}

/**
 * Initialize button animations
 * Handles hover and click states with padding adjustments
 */
function initializeButton(button) {
  const computedStyle = window.getComputedStyle(button);
  const padding = {
    left: parseFloat(computedStyle.paddingLeft),
    right: parseFloat(computedStyle.paddingRight)
  };

  gsap.set(button, { opacity: 1 });

  // Add hover animations
  button.addEventListener('mouseenter', () => {
    gsap.to(button, DEFAULTS.buttonAnimations.hover.enter(padding));
  });

  button.addEventListener('mouseleave', () => {
    gsap.to(button, DEFAULTS.buttonAnimations.hover.leave(padding));
  });

  // Add click animations
  button.addEventListener('mousedown', () => {
    gsap.to(button, DEFAULTS.buttonAnimations.click.down);
  });

  button.addEventListener('mouseup', () => {
    gsap.to(button, DEFAULTS.buttonAnimations.click.up);
  });
}

/**
 * Main initialization function
 * Sets up all animations, buttons, and replay functionality
 */
function initializeAnimations(skipAnimation = false) {
  cleanup();

  // Initialize main animations
  Object.entries(animations).forEach(([type, config]) => {
    document.querySelectorAll(SELECTORS.getAnimationElements(type))
      .forEach(element => applyTrigger(element, config, skipAnimation));
  });

  // Initialize buttons
  document.querySelectorAll(SELECTORS.buttons)
    .forEach(initializeButton);

  // Initialize replay buttons
  document.querySelectorAll(SELECTORS.replayButtons)
    .forEach(button => {
      button.addEventListener('click', () => {
        const targetId = button.getAttribute('voomreplay-for');
        if (targetId) {
          const instance = instances.get(document.getElementById(targetId));
          if (instance) {
            gsap.set(instance.target, instance.config.reset);
            gsap.from(instance.target, instance.config.from);
          }
        }
      });
    });
}

// Handle resize events with debouncing
const handleResize = debounce(() => {
  initializeAnimations(true); // Pass true to skip animations on resize
}, 250);

// Initialize library
loadDependencies().then(success => {
  if (success) {
    // Initialize based on environment (Webflow or standalone)
    if (window.Webflow) {
      window.Webflow ||= [];
      window.Webflow.push(initializeAnimations);
    } else {
      initializeAnimations();
    }
    // Add resize handler
    window.addEventListener('resize', handleResize);
  }
}); 