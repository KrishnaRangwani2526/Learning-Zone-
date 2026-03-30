import { motion } from "framer-motion";
import { Target, Users, Award } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Focused Learning",
    description: "Structured curriculum designed to maximize understanding and retention for competitive exams.",
  },
  {
    icon: Users,
    title: "Expert Faculty",
    description: "Learn from experienced educators with decades of teaching and mentoring excellence.",
  },
  {
    icon: Award,
    title: "Proven Results",
    description: "Thousands of students have achieved top ranks under our guidance year after year.",
  },
];

const AboutSection = () => (
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
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="rounded-xl bg-card p-8 text-center hover:shadow-lg transition-shadow border border-border"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-5">
              <f.icon size={26} />
            </div>
            <h3 className="font-display text-xl text-foreground">{f.title}</h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutSection;
