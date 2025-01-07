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
        // Header animation (hdr_1)
        const hdr1 = new SplitType('[voomsh="hdr_1"]', { types: 'chars' });  
        gsap.from(hdr1.chars, {
          rotationX: -180,
          duration: 0.4,
          stagger: 0.05,
          opacity: 0,
          scale: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: '[voomsh="txt_1"]',
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
            markers: false
          }
        });

        // Paragraph animation (par_1)
        const par1 = new SplitType('[voomsh="par_1"]', { types: 'lines' });
        gsap.fromTo(
          par1.lines, 
          {
            opacity: 0,
            x: 50
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            stagger: 0.15,
            ease: "circ.out",
            scrollTrigger: {
              trigger: '[voomsh="par_1"]',
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
              markers: false
            }
          }
        );

        // Button animations (btn_1)
        const buttons = document.querySelectorAll('[voomsh="btn_1"]');
        buttons.forEach(button => {
          gsap.set(button, {
            scale: 1,
            boxShadow: "none"
          });

          button.addEventListener("mouseenter", () => {
            const buttonColor = window.getComputedStyle(button).backgroundColor;
            gsap.fromTo(button,
              {
                scale: 1,
                boxShadow: "none"
              },
              {
                scale: 1.1,
                boxShadow: `0 0 15px ${buttonColor.replace(")", ", 1)")}`,
                duration: 0.4,
                ease: "circ.out"
              }
            );
          });

          button.addEventListener("mousedown", () => {
            gsap.fromTo(button,
              {
                scale: 1.1
              },
              {
                scale: 0.95,
                duration: 0.05,
                ease: "circ.out"
              }
            );
          });

          button.addEventListener("mouseup", () => {
            gsap.fromTo(button,
              {
                scale: 0.95
              },
              {
                scale: 1.1,
                duration: 0.2,
                ease: "circ.out"
              }
            );
          });

          button.addEventListener("mouseleave", () => {
            gsap.fromTo(button,
              {
                scale: 1.1,
                boxShadow: `0 0 15px ${window.getComputedStyle(button).backgroundColor.replace(")", ", 1)")}`
              },
              {
                scale: 1,
                boxShadow: "none",
                duration: 0.4,
                ease: "circ.out"
              }
            );
          });
        });
      });
    });
}); 