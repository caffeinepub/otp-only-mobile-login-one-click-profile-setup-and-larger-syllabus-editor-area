// Simplified brand accent system using only Red and Blue
// Provides Tailwind-safe literal class strings for consistent branding

export type BrandColor = 'red' | 'blue';

// Fixed brand accent classes - Red primary, Blue secondary
export interface AccentClasses {
  text: string;
  bg: string;
  bgSubtle: string;
  border: string;
  ring: string;
  hoverBg: string;
  hoverText: string;
  hoverBorder: string;
}

// Get brand accent classes (red or blue)
export function getBrandClasses(color: BrandColor = 'red'): AccentClasses {
  if (color === 'blue') {
    return {
      text: 'text-brand-blue',
      bg: 'bg-brand-blue',
      bgSubtle: 'bg-brand-blue/10',
      border: 'border-brand-blue',
      ring: 'ring-brand-blue',
      hoverBg: 'hover:bg-brand-blue/10',
      hoverText: 'hover:text-brand-blue',
      hoverBorder: 'hover:border-brand-blue',
    };
  }
  
  // Default to red
  return {
    text: 'text-brand-red',
    bg: 'bg-brand-red',
    bgSubtle: 'bg-brand-red/10',
    border: 'border-brand-red',
    ring: 'ring-brand-red',
    hoverBg: 'hover:bg-brand-red/10',
    hoverText: 'hover:text-brand-red',
    hoverBorder: 'hover:border-brand-red',
  };
}

// Alternate between red and blue for variety
export function getBrandByIndex(index: number): BrandColor {
  return index % 2 === 0 ? 'red' : 'blue';
}

// Get card classes with brand accent
export function getCardClasses(color: BrandColor = 'red'): string {
  const classes = getBrandClasses(color);
  return `border-l-4 ${classes.border} ${classes.hoverBg} transition-all hover:shadow-lg`;
}

// Get badge classes with brand accent
export function getBadgeClasses(color: BrandColor = 'red'): string {
  const classes = getBrandClasses(color);
  return `${classes.bgSubtle} ${classes.text} border ${classes.border}/30`;
}

// Get button classes with brand accent
export function getButtonClasses(color: BrandColor = 'red'): string {
  const classes = getBrandClasses(color);
  return `${classes.bg} hover:${classes.bg}/90 text-white`;
}

// Get tab trigger classes with brand accent
export function getTabTriggerClasses(color: BrandColor = 'red'): string {
  if (color === 'blue') {
    return 'data-[state=active]:bg-brand-blue/10 data-[state=active]:text-brand-blue';
  }
  return 'data-[state=active]:bg-brand-red/10 data-[state=active]:text-brand-red';
}

// Get accordion trigger classes with brand accent
export function getAccordionTriggerClasses(color: BrandColor = 'red'): string {
  const classes = getBrandClasses(color);
  return `${classes.hoverBg} transition-colors`;
}

// Get numbered item classes alternating between red and blue
export function getNumberedItemClasses(index: number): {
  borderLeft: string;
  numberBg: string;
  numberText: string;
} {
  const color = getBrandByIndex(index);
  const classes = getBrandClasses(color);
  
  return {
    borderLeft: `border-l-4 ${classes.border}`,
    numberBg: classes.bgSubtle,
    numberText: classes.text,
  };
}

// Get metric card classes for dashboard (alternating red/blue)
export function getMetricCardClasses(index: number): string {
  const color = getBrandByIndex(index);
  const classes = getBrandClasses(color);
  return `border-l-4 ${classes.border} ${classes.bgSubtle}`;
}

// Get chart color for recharts (alternating red/blue)
export function getChartColor(index: number): string {
  const color = getBrandByIndex(index);
  return color === 'red' ? 'oklch(55% 0.22 25)' : 'oklch(50% 0.15 240)';
}

// Legacy compatibility - map old accent names to brand colors
export function getAccentClasses(legacyName?: string): AccentClasses {
  // Map legacy accent names to brand colors
  // Red-ish accents -> red, Blue-ish accents -> blue
  const redAccents = ['red', 'pink', 'orange', 'amber'];
  const blueAccents = ['blue', 'teal', 'cyan', 'violet', 'purple', 'green'];
  
  if (legacyName && blueAccents.includes(legacyName)) {
    return getBrandClasses('blue');
  }
  
  return getBrandClasses('red');
}

// Subject-based accent (alternates between red and blue)
export function getSubjectAccent(subject: string): BrandColor {
  // Hash the subject name to get consistent color
  const hash = subject.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return hash % 2 === 0 ? 'red' : 'blue';
}
