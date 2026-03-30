import { motion } from "framer-motion";
import { BookOpen, Beaker, Calculator, Globe } from "lucide-react";

const courses = [
  { icon: Calculator, title: "Mathematics", students: "1,200+" },
  { icon: Beaker, title: "Physics", students: "980+" },
  { icon: BookOpen, title: "Chemistry", students: "850+" },
  { icon: Globe, title: "General Studies", students: "1,500+" },
];

const CoursesSection = () => (
  <section className="py-20 md:py-28 bg-muted/50">
    <div className="container px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <h2 className="font-display text-3xl md:text-4xl text-foreground">Our Courses</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Comprehensive programs tailored for competitive exam preparation across all major subjects.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group rounded-xl bg-background p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <c.icon size={22} />
            </div>
            <h3 className="font-display text-lg text-foreground">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.students} students enrolled</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CoursesSection;
