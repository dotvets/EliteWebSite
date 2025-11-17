export { fadeIn, fadeInUp, fadeInDown, fadeInUpSoft } from './fade';
export { slideLeft, slideRight } from './slide';
export { zoomIn, zoomInSoft } from './zoom';
export { staggerContainer, staggerList, staggerGrid } from './stagger';

export const animations = {
  fadeIn: 'fadeIn',
  fadeInUp: 'fadeInUp',
  fadeInDown: 'fadeInDown',
  fadeInUpSoft: 'fadeInUpSoft',
  slideLeft: 'slideLeft',
  slideRight: 'slideRight',
  zoomIn: 'zoomIn',
  zoomInSoft: 'zoomInSoft',
  staggerContainer: 'staggerContainer',
  staggerList: 'staggerList',
  staggerGrid: 'staggerGrid'
} as const;

export type AnimationVariant = keyof typeof animations;
