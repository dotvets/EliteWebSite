# Elite Vet Website Design Guidelines

## Design Approach

**Hybrid Approach:** Combining healthcare professionalism with modern service-based design patterns, inspired by trusted platforms like Airbnb (for warmth and credibility) and Apple (for clean minimalism), while strictly adhering to Elite Vet's established brand identity.

**Core Principle:** Create a compassionate, trustworthy digital experience that reassures pet owners while showcasing clinical excellence through clean, professional design.

---

## Brand Integration

### Color System (Strictly Per Brand Guidelines)
- **Primary Purple:** #7760a8 (rgba(119, 96, 168) / hsl(259, 29%, 52%)) - Headers, primary CTAs, key accents, brand identity
- **Neutral Gray:** #9d9ea0 (rgba(157, 158, 160) / hsl(220, 2%, 62%)) - Secondary text, supporting elements, borders
- **Off-White:** #fbfbfb (rgba(251, 251, 251) / hsl(0, 0%, 98%)) - Light backgrounds, cards, clean surfaces
- **Pure White:** #ffffff - Main background, maximum contrast
- **Text Colors:** Dark gray for body text, muted gray for secondary text

### Typography
- **Primary Font:** Rubik (via Google Fonts CDN) - Thin, Light, Regular, Bold, Black weights
  - Used for: Headers, navigation, buttons, primary content
- **Secondary Font:** Poppins (via Google Fonts CDN) - For body text and supporting content
- **Decorative Font:** Daily Shine - For special highlights (if needed)
- **Arabic Font:** FF Shamel Sans - For all Arabic content
- **Hierarchy:**
  - H1: 3xl/4xl (48-56px) - Bold/Black - Hero headlines (Rubik)
  - H2: 2xl/3xl (36-48px) - Bold - Section headers (Rubik)
  - H3: xl/2xl (24-30px) - Regular/Bold - Subsection titles (Rubik)
  - Body: base/lg (16-18px) - Regular - Content (Poppins)
  - Small: sm (14px) - Regular - Captions, metadata (Poppins)

---

## Layout System

### Spacing Primitives (Tailwind Units)
Use consistent spacing: **4, 6, 8, 12, 16, 20, 24, 32** for predictable rhythm.
- Component padding: p-6, p-8
- Section spacing: py-16, py-20, py-24
- Card gaps: gap-6, gap-8
- Container: max-w-7xl with px-6 lg:px-8

### Grid Strategy
- Hero: Full-width with centered content overlay
- Content sections: max-w-7xl container
- Feature grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Two-column sections: lg:grid-cols-2 for text+image pairings

---

## Component Library

### Navigation
- Sticky header with transparent-to-solid transition on scroll
- Logo on left (minimum 100px width per brand guidelines)
- Horizontal nav menu: Home, About, Services, Team, Contact
- Primary CTA button: "Book Appointment" in Royal Purple with white text
- Mobile: Hamburger menu with slide-in drawer

### Hero Section
- **Full-viewport slider** using Embla Carousel with autoplay
- Multiple slides featuring:
  - Slide 1: Warm veterinarian with happy pet
  - Slide 2: Modern clinic facility interior
  - Slide 3: Happy pet owner with healthy pet
- Overlay: Semi-transparent dark gradient (bottom-up) for text readability
- Centered content with:
  - Large headline (H1) in white
  - Subheadline (lg text) in white/95% opacity
  - Primary CTA button with **blurred background** (backdrop-blur-md, bg-purple/20, border-white/30)
- Carousel indicators: Small dots in Mikado Yellow
- Auto-advance: 5-second intervals with smooth fade transitions

### Section Components

**Intro About Elite:**
- Two-column layout: Image left (veterinarian with pet), text right
- Image: Rounded corners (rounded-xl), shadow-lg
- Text: H2 header in Royal Purple, body text in gray-700
- CTA: Text link in Picton Blue with arrow icon (Lucide ArrowRight)

**Service Categories:**
- Grid of 3-4 service cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Each card: Icon (Lucide icons in Picton Blue), title (H3), brief description
- Hover: Subtle lift (transform scale-105), shadow increase
- Icons: Stethoscope, Syringe, Heart, Scissors (representing check-ups, vaccinations, care, surgery)
- Background: White cards on subtle Verdigris/5% background section

**Why Choose Us:**
- Centered headline with statistics callout
- "200,000,000 pets" in large Mikado Yellow number (5xl font)
- Three-column benefit grid with icons:
  - Personalized Care (User icon)
  - Latest Technology (Cpu icon)
  - Compassionate Staff (Heart icon)
- Each benefit: Icon in colored circle, title, description

**Our Team:**
- Section with H2 header
- Placeholder for team member cards (3-4 across)
- Each card: Circular photo placeholder, name (H3), title, brief bio
- Monochromatic hover effect on photos

**Partners:**
- Centered section with partner logos
- Display: Vest Van and Elite Falcons logos side-by-side
- Logos in original colors on white/light gray cards
- Subtle shadow and spacing between cards

### Contact Form
- Clean single-column form in max-w-2xl container
- Form fields with consistent styling:
  - Input/textarea: border-gray-300, focus:border-picton-blue, rounded-lg
  - Labels: font-medium in gray-700
  - Validation errors: text-red-600, border-red-300
- Submit button: Royal Purple background, white text, hover:brightness-110
- Include Lucide icons for input types (User, Phone, Mail, MessageSquare)

### Footer
- Three-column layout (lg:grid-cols-3):
  - Column 1: Logo + tagline
  - Column 2: Quick links (About, Services, Contact)
  - Column 3: Contact info with icons
- Background: Deep purple gradient (from Royal Purple to darker shade)
- Text: White/gray-200
- Copyright bar: Centered, smaller text, border-top

---

## Images

### Required Images:
1. **Hero Slider (3 images):**
   - Image 1: Veterinarian in white coat examining a happy golden retriever - warm, professional atmosphere
   - Image 2: Modern, clean clinic examination room with natural lighting - showcasing facilities
   - Image 3: Smiling pet owner holding a healthy cat - emphasizing happy outcomes

2. **Intro Section:**
   - Compassionate veterinarian holding a small dog, gentle interaction - conveys care and expertise

3. **Team Section:**
   - Professional headshots of 3-4 veterinarians in medical attire - circular cropped

4. **Partner Logos:**
   - Vest Van logo
   - Elite Falcons logo

**Image Treatment:** All photos use subtle rounded corners (rounded-xl), professional color grading with slight warmth, and shadow-lg for depth.

---

## Animations

### Minimal, Purposeful Motion:
- Hero slider: Smooth 800ms fade transitions between slides
- Scroll reveal: Fade-up effect on section entry (once) using Framer Motion
- Hover states: Subtle 200ms transitions on cards and buttons
- Form validation: Shake animation on error (Framer Motion)
- **No parallax, no continuous animations, no distracting effects**

---

## Accessibility & Quality Standards

- WCAG AA contrast ratios for all text
- Focus indicators: 2px Royal Purple outline with offset
- Form labels always visible (no placeholder-only inputs)
- Semantic HTML: proper heading hierarchy, landmarks
- Alt text for all images
- Keyboard navigation fully supported
- Arabic RTL support prepared (text-right, flex-row-reverse classes ready)

---

## Bilingual Considerations (English First, Arabic Ready)

- Layout uses flex/grid structures that adapt to RTL
- Text alignment utilities prepared: text-left/text-right toggles
- IBM Plex Sans Arabic supports both English and Arabic beautifully
- Language switcher placeholder in header (flag icon + dropdown)
- All spacing/layout remains consistent in both directions

---

**Outcome:** A warm, professional, trustworthy veterinary website that balances medical credibility with compassionate pet care, fully aligned with Elite Vet's brand identity and optimized for conversion through clear CTAs and compelling visual storytelling.