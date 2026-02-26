"use client";

import { motion } from "framer-motion";

const LOGOS = [
  "Saudi National Bank",
  "QNB",
  "Al Rajhi",
  "STC Pay",
  "ZATCA",
  "NEOM",
  "Aramco",
  "SABIC",
];

export function CustomerLogosBar() {
  return (
    <section className="py-12 bg-landing-gray border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <p className="text-center text-xs font-medium text-zinc-500 uppercase tracking-widest mb-8">
          Trusted by leading GCC enterprises
        </p>
        <div className="flex items-center justify-center gap-12 md:gap-16 overflow-x-auto scrollbar-hide py-2">
          {[...LOGOS, ...LOGOS].map((name, i) => (
            <motion.div
              key={`${name}-${i}`}
              initial={{ opacity: 0.6 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="shrink-0 text-zinc-500 hover:text-white transition-colors text-sm font-semibold whitespace-nowrap"
            >
              {name}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
