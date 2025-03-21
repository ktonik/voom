# Voom.sh Animations

A collection of ready-to-use animation for Wordpress, Webflow and HTML websites
[![Watch the demo](https://img.youtube.com/vi/Uy-hrW0gmy4/0.jpg)](https://youtu.be/Uy-hrW0gmy4)


## Quick Start

Add this script to your project before the closing `</body>` tag:

Current version:
```html
<script src="https://cdn.jsdelivr.net/gh/ktonik/voom@v1.0.4/dist/voom-demo.min.js"></script>
```

## Usage

You can trigger animations using either HTML classes or attributes. 
Choose whichever is easier for you:


### Using Classes
For Wordpress (Elementor, Gutenberg and other builders)

```html
<!-- Same animations using classes -->
<h1 class="voomsh-hdr-1">
  This header will animate
</h1>

<p class="voomsh-par-1">
  This paragraph will animate line by line
</p>

<button class="voomsh-btn-1">
  Hover & Click Me
</button>
```

### Using Attributes
For Webflow (via setting panel)

```html
<!-- Header animation -->
<h1 voomsh="hdr-1">
  This header will animate
</h1>

<!-- Paragraph animation -->
<p voomsh="par-1">
  This paragraph will animate
</p>

<!-- Button animation -->
<button voomsh="btn-1">
  Hover & Click Me
</button>
```

## Dependencies
This script automatically loads:
- GSAP
- GSAP ScrollTrigger
- Split Type

No need to add these separately!