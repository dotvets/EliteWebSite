export { fadeIn, fadeInUp, fadeInDown } from './fade';
export { slideLeft, slideRight } from './slide';
export { zoomIn, zoomInSoft } from './zoom';
export { staggerContainer, staggerList, staggerGrid } from './stagger';

export const animations = {
  fadeIn: 'fadeIn',
  fadeInUp: 'fadeInUp',
  fadeInDown: 'fadeInDown',
  slideLeft: 'slideLeft',
  slideRight: 'slideRight',
  zoomIn: 'zoomIn',
  zoomInSoft: 'zoomInSoft',
  staggerContainer: 'staggerContainer',
  staggerList: 'staggerList',
  staggerGrid: 'staggerGrid'
} as const;

export type AnimationVariant = keyof typeof animations;
