export default function throttle(fn, duration) {
  let lock;
  return () => {
    if (lock) return;
    fn.apply(this, arguments);
    lock = setTimeout(() => lock = null, duration);
  };
}
