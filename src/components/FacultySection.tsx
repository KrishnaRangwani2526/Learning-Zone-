import { motion } from "framer-motion";

const faculty = [
  { name: "Dr. Anil Sharma", subject: "Mathematics", experience: "20+ years" },
  { name: "Prof. Meera Patel", subject: "Physics", experience: "15+ years" },
  { name: "Dr. Rajesh Kumar", subject: "Chemistry", experience: "18+ years" },
];

const FacultySection = () => (
  <section className="py-20 md:py-28">
    <div className="container px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <h2 className="font-display text-3xl md:text-4xl text-foreground">Our Faculty</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Learn from the best minds who are passionate about shaping futures.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {faculty.map((f, i) => (
          <motion.div
            key={f.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="rounded-xl bg-card border border-border p-6 text-center hover:shadow-lg transition-shadow"
          >
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center font-display text-2xl text-muted-foreground">
              {f.name.charAt(0)}
            </div>
            <h3 className="font-display text-lg text-foreground">{f.name}</h3>
            <p className="text-sm text-primary font-medium mt-1">{f.subject}</p>
            <p className="text-xs text-muted-foreground mt-1">{f.experience} experience</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FacultySection;
