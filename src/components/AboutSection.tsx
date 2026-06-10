import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Users, Award } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const features = [
  {
    icon: Target,
    title: "Focused Learning",
    description: "Structured curriculum designed to maximize understanding and retention for competitive exams.",
    details: [
      "Topic-wise micro-lessons aligned with the latest exam syllabus.",
      "Weekly practice tests with detailed performance analytics.",
      "Personalized study plans based on each student's strengths and weaknesses.",
      "Doubt-clearing sessions held twice a week with subject experts.",
    ],
    footer: "Our learning framework helps students stay consistent and exam-ready throughout the year.",
  },
  {
    icon: Users,
    title: "Expert Faculty",
    description: "Learn from experienced educators with decades of teaching and mentoring excellence.",
    details: [
      "Faculty drawn from premier institutions with 10+ years of teaching experience.",
      "One-on-one mentoring sessions to track individual progress.",
      "Regular workshops on exam strategy, time management and stress handling.",
      "Dedicated subject specialists for Mathematics, Science, Reasoning and English.",
    ],
    footer: "Every mentor is committed to building both academic strength and confidence.",
  },
  {
    icon: Award,
    title: "Proven Results",
    description: "Thousands of students have achieved top ranks under our guidance year after year.",
    details: [
      "500+ selections in government and competitive examinations.",
      "Consistent 90%+ pass rate across foundation and advanced batches.",
      "Multiple students featured in state-level merit lists every year.",
      "Alumni placed in top engineering, medical and defence services.",
    ],
    footer: "Results that speak for themselves — driven by hard work, strategy and support.",
  },
];

const AboutSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex !== null ? features[activeIndex] : null;

  return (
    <section className="py-20 md:py-28">
      <div className="container px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl text-foreground">Why Choose Us</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We combine traditional teaching values with modern pedagogical methods to deliver an unmatched learning experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.button
              type="button"
              onClick={() => setActiveIndex(i)}
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ y: -4 }}
              className="text-left rounded-xl bg-card p-8 text-center hover:shadow-lg transition-all border border-border hover:border-primary/40 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-5">
                <f.icon size={26} />
              </div>
              <h3 className="font-display text-xl text-foreground">{f.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              <p className="mt-4 text-xs text-primary font-medium">Click to learn more →</p>
            </motion.button>
          ))}
        </div>
      </div>

      <Dialog open={activeIndex !== null} onOpenChange={(o) => !o && setActiveIndex(null)}>
        <DialogContent className="sm:max-w-md">
          {active && (
            <>
              <DialogHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
                  <active.icon size={22} />
                </div>
                <DialogTitle className="font-display text-2xl">{active.title}</DialogTitle>
                <DialogDescription>{active.description}</DialogDescription>
              </DialogHeader>
              <ul className="mt-2 space-y-2">
                {active.details.map((d) => (
                  <li key={d} className="flex gap-2 text-sm text-foreground">
                    <span className="text-primary mt-1">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground italic border-t border-border pt-3 mt-3">
                {active.footer}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AboutSection;
