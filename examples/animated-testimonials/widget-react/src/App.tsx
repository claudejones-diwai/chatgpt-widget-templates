import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme, useToolData } from "./hooks";
import type { AnimatedTestimonialsOutput } from "../../shared-types/tool-output";

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function App() {
  const theme = useTheme();
  const toolData = useToolData<AnimatedTestimonialsOutput>();

  const [active, setActive] = useState(0);
  const testimonials = toolData?.testimonials || [];
  const autoplay = toolData?.autoplay ?? true;

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index: number) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay && testimonials.length > 1) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, active]);

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10;
  };

  if (!toolData || testimonials.length === 0) {
    return (
      <div className={theme === "dark" ? "dark" : ""}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Loading testimonials...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div
          className={cn(
            "max-w-sm md:max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-20"
          )}
        >
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-20">
            {/* Image Carousel */}
            <div>
              <div className="relative h-80 w-full">
                <AnimatePresence>
                  {testimonials.map((testimonial, index) => (
                    <motion.div
                      key={testimonial.src}
                      initial={{
                        opacity: 0,
                        scale: 0.9,
                        z: -100,
                        rotate: randomRotateY(),
                      }}
                      animate={{
                        opacity: isActive(index) ? 1 : 0.7,
                        scale: isActive(index) ? 1 : 0.95,
                        z: isActive(index) ? 0 : -100,
                        rotate: isActive(index) ? 0 : randomRotateY(),
                        zIndex: isActive(index)
                          ? 999
                          : testimonials.length + 2 - index,
                        y: isActive(index) ? [0, -80, 0] : 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                        z: 100,
                        rotate: randomRotateY(),
                      }}
                      transition={{
                        duration: 0.4,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 origin-bottom"
                    >
                      <img
                        src={testimonial.src}
                        alt={testimonial.name}
                        draggable={false}
                        className="h-full w-full rounded-3xl object-cover object-center"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Content */}
            <div className="flex justify-between flex-col py-4">
              <motion.div
                key={active}
                initial={{
                  y: 20,
                  opacity: 0,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                }}
                exit={{
                  y: -20,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut",
                }}
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {testimonials[active].name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {testimonials[active].designation}
                </p>
                <motion.p className="text-lg text-gray-700 dark:text-gray-300 mt-8">
                  {testimonials[active].quote.split(" ").map((word, index) => (
                    <motion.span
                      key={index}
                      initial={{
                        filter: "blur(10px)",
                        opacity: 0,
                        y: 5,
                      }}
                      animate={{
                        filter: "blur(0px)",
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.2,
                        ease: "easeInOut",
                        delay: 0.02 * index,
                      }}
                      className="inline-block"
                    >
                      {word}&nbsp;
                    </motion.span>
                  ))}
                </motion.p>
              </motion.div>

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-12 md:pt-0">
                <button
                  onClick={handlePrev}
                  className="h-7 w-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center group/button hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-900 dark:text-gray-100 group-hover/button:rotate-12 transition-transform duration-300" />
                </button>
                <button
                  onClick={handleNext}
                  className="h-7 w-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center group/button hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <ArrowRight className="h-5 w-5 text-gray-900 dark:text-gray-100 group-hover/button:-rotate-12 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Debug info (only shown in development) */}
          {import.meta.env.DEV && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
              <div className="font-mono text-gray-600 dark:text-gray-400">
                <div>Theme: {theme}</div>
                <div>Testimonials: {testimonials.length}</div>
                <div>Active: {active + 1}</div>
                <div>Autoplay: {autoplay ? "Yes" : "No"}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
