# Voom Animation Templates

A collection of ready-to-use animation templates for Webflow projects.

## Quick Start

Add this script to your project before the closing `</body>` tag:

Current version:
```html
<script src="https://cdn.jsdelivr.net/gh/ktonik/voom@v1.0.4/dist/voom-demo.min.js"></script>
```

## Usage

You can trigger animations using either HTML attributes or classes - choose whichever is easier for you:

### Using Attributes
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

### Using Classes
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

## Dependencies
This script automatically loads:
- GSAP
- GSAP ScrollTrigger
- Split Type

No need to add these separately!