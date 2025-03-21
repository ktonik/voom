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

Add animations using HTML classes or attributes. 
Choose whichever is easier for you:


### Add Class
For Wordpress (Elementor, Gutenberg and other builders), add class name for example `"voomsh-hdr-1"`

```html
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

### Add Attribute
For Webflow (via setting panel) add attribute name, for example `voomsh="hdr-1"`

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

### Thats it, you are good to go! 

## Dependencies
This script automatically loads:
- GSAP
- GSAP ScrollTrigger
- Split Type

No need to add these separately!