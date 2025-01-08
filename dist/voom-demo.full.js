// Load dependencies first
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// Animation definitions
const animations = {
  hdr_1: {
    setup: (element) => new SplitType(element, { types: 'words' }),
    getTarget: (split) => split.words,
    from: {
      x: -40,
      skewX: 15,
      duration: 0.5,
      stagger: 0.1,
      opacity: 0,
      ease: "circ.out"
    },
    reset: {
      opacity: 1,
      skewX: 0,
      x: 0
    }
  },
  par_1: {
    setup: (element) => new SplitType(element, { types: 'lines' }),
    getTarget: (split) => split.lines,
    from: {
      y: -30,
      stagger: 0.2,
      duration: 0.6,
      opacity: 0,
      ease: "circ.out"
    },
    reset: {
      y: 0,
      opacity: 1
    }
  }
};

// Store animation instances for replay
const animationInstances = new Map();

// Trigger handler
function applyTrigger(element, animConfig) {
  const triggerType = element.getAttribute('voomtrigger') || 'scroll';
  const split = animConfig.setup(element);
  const target = animConfig.getTarget(split);
  
  // Store animation data for replay
  const animationData = {
    target,
    config: animConfig,
    element
  };
  
  // Store in Map using the element's target attribute as key
  const replayTarget = element.getAttribute('voomreplay-target');
  if (replayTarget) {
    animationInstances.set(replayTarget, animationData);
  }
  
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
        start: "top 90%",
        end: "bottom 10%",
        toggleActions: "play none none reverse",
        markers: false
      };
      gsap.from(target, scrollAnimation);
  }
}

// Replay function
function replayAnimation(targetId) {
  const animData = animationInstances.get(targetId);
  if (animData) {
    gsap.set(animData.target, animData.config.reset);
    gsap.from(animData.target, animData.config.from);
  }
}

// Load all scripts in sequence
Promise.all([
  loadScript('https://unpkg.com/split-type'),
  loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js')
]).then(() => {
  // Load ScrollTrigger after GSAP
  loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js')
    .then(() => {
      // Initialize GSAP plugins
      gsap.registerPlugin(ScrollTrigger);

      window.Webflow ||= [];
      window.Webflow.push(() => {
        // Apply animations to elements
        Object.entries(animations).forEach(([type, config]) => {
          const elements = document.querySelectorAll(`[voomsh="${type}"]`);
          elements.forEach(element => applyTrigger(element, config));
        });

        // Set up replay buttons
        const replayButtons = document.querySelectorAll('[voomsh="replay"]');
        replayButtons.forEach(button => {
          button.addEventListener('click', () => {
            const targetId = button.getAttribute('voomreplay-for');
            if (targetId) {
              replayAnimation(targetId);
            }
          });
        });

        // Button animations (btn_1)
        const buttons = document.querySelectorAll('[voomsh="btn_1"]');
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
      });
    });
}); 