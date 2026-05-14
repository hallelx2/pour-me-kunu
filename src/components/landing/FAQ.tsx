"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { landingCopy } from "@/lib/landing-copy";

export function FAQ() {
  const c = landingCopy.faq;

  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-kunu-clay/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-kunu-clay">
            {c.eyebrow}
          </div>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-kunu-ink text-balance sm:text-5xl lg:text-6xl">
            {c.headline}
          </h2>
        </motion.div>

        <AccordionPrimitive.Root
          type="single"
          collapsible
          className="mt-12 space-y-3"
        >
          {c.items.map((item, idx) => (
            <motion.div
              key={item.q}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
            >
              <AccordionPrimitive.Item
                value={`item-${idx}`}
                className="group overflow-hidden rounded-2xl border-2 border-kunu-ink/8 bg-kunu-cream-deep/30 transition-colors data-[state=open]:border-kunu-terracotta/40 data-[state=open]:bg-kunu-cream"
              >
                <AccordionPrimitive.Header className="flex">
                  <AccordionPrimitive.Trigger className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-display text-lg font-semibold text-kunu-ink transition-all hover:bg-kunu-cream/40 sm:text-xl">
                    <span className="flex-1 text-pretty">{item.q}</span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-kunu-ink/10 bg-kunu-cream text-kunu-terracotta transition-transform group-data-[state=open]:rotate-45 group-data-[state=open]:bg-kunu-terracotta group-data-[state=open]:text-kunu-cream">
                      <Plus className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>
                <AccordionPrimitive.Content className="overflow-hidden text-base leading-relaxed text-kunu-ink-soft data-[state=closed]:animate-[accordion-up_240ms_ease] data-[state=open]:animate-[accordion-down_240ms_ease]">
                  <div className="px-6 pb-6 pt-1 text-pretty">{item.a}</div>
                </AccordionPrimitive.Content>
              </AccordionPrimitive.Item>
            </motion.div>
          ))}
        </AccordionPrimitive.Root>
      </div>
    </section>
  );
}
