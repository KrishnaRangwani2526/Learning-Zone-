import { motion } from "framer-motion";

const galleryImages = [
  "/photo1.png",
  "/photo2.png",
  "/photo3.png",
  "/photo4.png",
  "/photo5.png",
  "/photo6.png"
];


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
        {galleryImages.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="aspect-[4/3] rounded-xl bg-card border border-border overflow-hidden group cursor-pointer"
          >
            <img 
              src={src} 
              alt={`Gallery photo ${i + 1}`} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default GallerySection;
