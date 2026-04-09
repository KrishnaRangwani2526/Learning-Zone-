import { motion } from "framer-motion";

const stats = [
  { value: "5+", label: "Years of Excellence" },
  { value: "1000+", label: "Students & Still Counting" },
  { value: "95%", label: "Success Rate" },
  { value: "50+", label: "Expert Faculty" },
];

const AchievementsSection = () => (
  <section className="py-20 md:py-28 bg-primary text-primary-foreground">
    <div className="container px-4 md:px-8">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-3xl md:text-4xl text-center mb-16"
      >
        Our Achievements
      </motion.h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="text-center"
          >
            <p className="font-display text-4xl md:text-5xl">{s.value}</p>
            <p className="mt-2 text-primary-foreground/70 text-sm font-medium uppercase tracking-wider">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AchievementsSection;
