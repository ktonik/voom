/**
 * Voom Animation Library
 * A lightweight animation library for Webflow and WordPress projects
 * Uses GSAP, ScrollTrigger, and SplitType for advanced animations
 */

/**
 * Helper function to dynamically load external scripts
 * Returns a Promise that resolves when the script is loaded
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
 * Animation Definitions
 * Each animation type contains:
 * - setup: Function to prepare the element (e.g., split text)
 * - getTarget: Function to get the animation target
 * - from: GSAP animation starting properties
 * - reset: Properties to reset to after animation
 */
const animations = {
  'hdr-1': {
    setup: (element) => {
      const lines = new SplitType(element, { types: 'lines' });
      const chars = new SplitType(lines.lines, { types: 'chars' });
      return { lines, chars };
    },
    getTarget: (split) => split.chars.chars,
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
  'par-1': {
    setup: (element) => {
      const lines = new SplitType(element, { types: 'lines' });
      const words = new SplitType(lines.lines, { types: 'words' });
      return { lines, words };
    },
    getTarget: (split) => split.words.words,
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
};

// Store animation instances for replay functionality
const animationInstances = new Map();

/**
 * Helper function to get elements by both attribute and class selectors
 * Supports both Webflow (attributes) and WordPress (classes) implementations
 */
function getElements(type) {
  const attrSelector = `[voomsh="${type}"]`;
  const classSelector = `.voomsh-${type}`;
  // Hide elements initially to prevent FOUC
  const elements = document.querySelectorAll(`${attrSelector}, ${classSelector}`);
  elements.forEach(el => {
    gsap.set(el, { opacity: 0, visibility: 'visible' });
  });
  return elements;
}

/**
 * Applies animation trigger to an element
 * Supports three trigger types:
 * - scroll: Triggers when element enters viewport
 * - hover: Triggers on mouse enter
 * - click: Triggers on click
 */
function applyTrigger(element, animConfig) {
  const triggerType = element.getAttribute('voomtrigger') || 'scroll';
  const split = animConfig.setup(element);
  const target = animConfig.getTarget(split);
  
  // Make the element visible after splitting
  gsap.set(element, { opacity: 1 });
  
  // Store animation data for potential replay
  const animationData = {
    target,
    config: animConfig,
    element
  };
  
  // Store for replay functionality if target is specified
  const replayTarget = element.getAttribute('voomreplay-target');
  if (replayTarget) {
    animationInstances.set(replayTarget, animationData);
  }
  
  // Handle different trigger types
  switch(triggerType) {
    case 'hover':
      gsap.set(target, animConfig.reset);
      element.addEventListener('mouseenter', () => {
        gsap.from(target, animConfig.from);
      });
      break;
    
    case 'click':
      gsap.set(target, animConfig.reset);
      element.addEventListener('click', () => {
        gsap.from(target, animConfig.from);
      });
      break;
    
    default: // 'scroll'
      const scrollAnimation = { ...animConfig.from };
      scrollAnimation.scrollTrigger = {
        trigger: element,
        start: "top 90%",    // Trigger when element's top hits 90% of viewport
        end: "bottom 10%",   // End when element's bottom hits 10% of viewport
        toggleActions: "play none none reverse", // Play on enter, reverse on leave
        markers: false       // Debug markers (set true for development)
      };
      gsap.from(target, scrollAnimation);
  }
}

/**
 * Replay function for manual animation triggers
 * Used with replay buttons targeting specific animations
 */
function replayAnimation(targetId) {
  const animData = animationInstances.get(targetId);
  if (animData) {
    gsap.set(animData.target, animData.config.reset);
    gsap.from(animData.target, animData.config.from);
  }
}

// Add CSS rule at the start of initialization
function addInitialStyles() {
  const style = document.createElement('style');
  style.textContent = `
    [voomsh], [class*="voomsh-"] {
      opacity: 0;
      visibility: hidden;
    }
  `;
  document.head.appendChild(style);
}

// Call this immediately
addInitialStyles();

/**
 * Main initialization function
 * Sets up all animations, replay buttons, and button interactions
 */
function initializeAnimations() {
  // Remove initial hiding styles
  const style = document.createElement('style');
  style.textContent = `
    [voomsh], [class*="voomsh-"] {
      visibility: visible;
    }
  `;
  document.head.appendChild(style);

  // Initialize main animations
  Object.entries(animations).forEach(([type, config]) => {
    const elements = getElements(type);
    elements.forEach(element => applyTrigger(element, config));
  });

  // Set up replay functionality
  const replayButtons = document.querySelectorAll('[voomsh="replay"], .voomsh-replay');
  replayButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('voomreplay-for');
      if (targetId) {
        replayAnimation(targetId);
      }
    });
  });

  // Initialize button hover/click animations
  const buttons = document.querySelectorAll('[voomsh="btn-1"], .voomsh-btn-1');
  buttons.forEach(button => {
    // Initial setup
    gsap.set(button, { opacity: 1 });

    // Store initial padding values
    const computedStyle = window.getComputedStyle(button);
    button.dataset.initialPaddingLeft = parseFloat(computedStyle.paddingLeft);
    button.dataset.initialPaddingRight = parseFloat(computedStyle.paddingRight);

    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        paddingLeft: parseFloat(button.dataset.initialPaddingLeft) * 1.2,
        paddingRight: parseFloat(button.dataset.initialPaddingRight) * 1.2,
        scale: 1.05,
        duration: 0.3,
        ease: "back.out(3)"
      });
    });

    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        paddingLeft: parseFloat(button.dataset.initialPaddingLeft),
        paddingRight: parseFloat(button.dataset.initialPaddingRight),
        scale: 1,
        duration: 0.3,
        ease: "back.out(1)"
      });
    });

    // Add click state
    button.addEventListener('mousedown', () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.1,
        ease: "power2.out"
      });
    });

    button.addEventListener('mouseup', () => {
      gsap.to(button, {
        scale: 1.05,
        duration: 0.1,
        ease: "power2.out"
      });
    });
  });
}

/**
 * Script Initialization
 * Loads dependencies and initializes animations
 * Works in both Webflow and standalone environments
 */
Promise.all([
  loadScript('https://unpkg.com/split-type'),
  loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js')
]).then(() => {
  // Load ScrollTrigger after GSAP
  loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js')
    .then(() => {
      // Initialize GSAP plugins
      gsap.registerPlugin(ScrollTrigger);

      // Initialize based on environment
      if (window.Webflow) {
        window.Webflow ||= [];
        window.Webflow.push(initializeAnimations);
      } else {
        // Direct initialization for non-Webflow environments
        initializeAnimations();
      }
    });
}); 