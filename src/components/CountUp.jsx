import { useEffect, useRef } from "react";
import { animate } from "framer-motion";

// Counts up from 0 to the value without re-rendering React on every frame
export default function CountUp({ value, duration = 0.8 }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => {
        node.textContent = Math.round(v).toLocaleString("en-US");
      },
    });
    return () => controls.stop();
  }, [value, duration]);

  return <span ref={ref}>0</span>;
}