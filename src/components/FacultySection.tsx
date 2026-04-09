import { motion } from "framer-motion";

const faculty = [
  { name: "Manohar Rangwani ", subject: "Mathematics", experience: "25", image: "/manohar.png", linkedin: "https://www.linkedin.com/in/manohar-rangwani-4305a43bb" },
  { name: "Rekha Rangwani", subject: "Science", experience: "22", image: "/rekha.png", linkedin: "https://www.linkedin.com/in/rekha-rangwani2810" },
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

      <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
        {faculty.map((f, i) => (
          <motion.a
            href={f.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            key={f.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="block rounded-xl bg-card border border-border p-6 text-center hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 transition-all cursor-pointer"
          >
            {f.image ? (
              <img src={f.image} alt={f.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary/10" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center font-display text-2xl text-muted-foreground">
                {f.name.charAt(0)}
              </div>
            )}
            <h3 className="font-display text-xl text-foreground">{f.name}</h3>
            <p className="text-sm text-primary font-medium mt-1">{f.subject}</p>
            <p className="text-xs text-muted-foreground mt-2">{f.experience} years of experience</p>
          </motion.a>
        ))}
      </div>
    </div>
  </section>
);

export default FacultySection;
