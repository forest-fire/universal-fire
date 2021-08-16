export enum NetworkDelay {
  /** can be fast but can be very, very slow */
  lifi = 'lifi',
  /** consistent but slow */
  mobile2g = 'mobile2g',
  /** consistent but relatively slow */
  mobile3g = 'mobile3g',
  /** consistent and decent performance */
  mobile4g = 'mobile4g',
  /** fast and consistent */
  wifi = 'wifi',
  /** faster than reasonable (1 to 5ms) ... for when you want perf over realism */
  lazer = 'lazer',
}
