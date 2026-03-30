import { motion } from "framer-motion";

const GallerySection = () => (
  <section className="py-20 md:py-28 bg-muted/50">
    <div className="container px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <h2 className="font-display text-3xl md:text-4xl text-foreground">Gallery</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          A glimpse into our vibrant campus life and learning environment.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="aspect-[4/3] rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground text-sm"
          >
            Photo {i + 1}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default GallerySection;
