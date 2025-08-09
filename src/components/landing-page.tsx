"use client";

// CartMate Landing Page
// Modern design with 3D animations and advanced effects

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  Users,
  MessageCircle,
  Lock,
  Zap,
  Heart,
  CheckCircle2,
  Edit3,
  ArrowRight,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// Theme Switcher Component
function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5 text-yellow-500" />
        ) : (
          <Moon className="h-5 w-5 text-blue-500" />
        )}
      </motion.div>
    </motion.button>
  );
}

// 3D Floating Elements Component
function FloatingElements() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Floating Orbs */}
      <motion.div
        style={{ y: y1, rotate }}
        className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        style={{ y: y2 }}
        className="absolute top-40 right-20 w-32 h-32 rounded-full bg-gradient-to-r from-accent/20 to-destructive/20 blur-2xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Geometric Shapes */}
      <motion.div
        style={{ y: y1, rotate: rotate }}
        className="absolute bottom-20 left-1/4 w-16 h-16 border-2 border-primary/30 rotate-45"
        animate={{
          rotateZ: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        style={{ y: y2 }}
        className="absolute top-1/3 right-10 w-12 h-12 bg-gradient-to-r from-secondary to-accent rounded-full opacity-20"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// Interactive 3D Card Component
function Interactive3DCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateXValue = (mouseY / rect.height) * 20;
    const rotateYValue = (mouseX / rect.width) * 20;

    setRotateX(-rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      style={{
        transformStyle: "preserve-3d",
        transformPerspective: 1000,
      }}
      className={`transform-gpu ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function LandingPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const yHero = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const yHeroSpring = useSpring(yHero, springConfig);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
        type: "tween" as const,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const floatingVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  const features = [
    {
      icon: ShoppingCart,
      title: "Smart Shopping Lists",
      description:
        "Create private or shared lists with beautiful real-time sync",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Users,
      title: "Real-time Collaboration",
      description:
        "Shop together with friends and family, see changes instantly",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      icon: MessageCircle,
      title: "Group Chat",
      description:
        "Chat about items, reply to messages, mention specific products",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: Lock,
      title: "Complete Privacy",
      description:
        "Each list is isolated like WhatsApp groups - your data stays private",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      icon: Edit3,
      title: "Smart Editing",
      description:
        "Edit items on the fly, delete unwanted items, track who did what",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Built with Next.js and optimized for speed with beautiful animations",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  const advancedFeatures = [
    "Reply to chat messages",
    "Mention items in chat with @",
    "Typing indicators",
    "Real-time item editing",
    "Smart invite system",
    "Email invitations",
    "Activity tracking",
    "Beautiful animations",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Theme Switcher */}
      <ThemeSwitcher />

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ y: yHeroSpring, opacity, scale }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative py-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center"
      >
        {/* 3D Floating Background Elements */}
        <FloatingElements />

        {/* Animated Grid Background */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <motion.div
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
            style={{
              backgroundImage: `
                linear-gradient(90deg, transparent 98%, rgba(var(--primary), 0.1) 100%),
                linear-gradient(180deg, transparent 98%, rgba(var(--primary), 0.1) 100%)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          {/* 3D Logo Animation */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <Interactive3DCard>
              <motion.div
                whileHover={{
                  scale: 1.1,
                  rotateY: 20,
                  rotateX: 10,
                }}
                className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm border border-primary/20 shadow-2xl"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* 3D Shopping Cart */}
                <motion.div
                  animate={{
                    rotateY: [0, 10, 0],
                    rotateX: [0, 5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ transform: "translateZ(20px)" }}
                >
                  <ShoppingCart className="h-12 w-12 text-primary drop-shadow-lg" />
                </motion.div>

                {/* Floating particles around logo */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-secondary rounded-full opacity-60"
                />
                <motion.div
                  animate={{
                    scale: [1.2, 1, 1.2],
                    rotate: [360, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -bottom-1 -left-1 w-3 h-3 bg-accent rounded-full opacity-40"
                />
              </motion.div>
            </Interactive3DCard>

            <motion.h1
              className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "200% 200%",
              }}
            >
              CartMate
            </motion.h1>
          </motion.div>

          {/* Tagline */}
          <motion.div variants={itemVariants} className="mb-8">
            <Badge
              variant="outline"
              className="px-4 py-2 text-sm font-medium mb-6"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Shopping Lists Meet WhatsApp
            </Badge>
            <h2 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
              Shop{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Together
              </span>
              <br />
              Chat{" "}
              <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Seamlessly
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Create collaborative shopping lists with real-time chat, smart
              editing, and beautiful animations. Experience the future of
              collaborative shopping.
            </p>
          </motion.div>

          {/* Enhanced CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {isSignedIn ? (
              <Interactive3DCard>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => router.push("/")}
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-2xl border-0 relative overflow-hidden"
                  >
                    <motion.div
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                    <span className="relative z-10 flex items-center">
                      Open CartMate
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </span>
                  </Button>
                </motion.div>
              </Interactive3DCard>
            ) : (
              <>
                <Interactive3DCard>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => router.push("/sign-up")}
                      size="lg"
                      className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-2xl border-0 relative overflow-hidden"
                    >
                      <motion.div
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      />
                      <span className="relative z-10 flex items-center">
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </span>
                    </Button>
                  </motion.div>
                </Interactive3DCard>

                <Interactive3DCard>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => router.push("/sign-in")}
                      variant="outline"
                      size="lg"
                      className="px-8 py-4 text-lg font-semibold backdrop-blur-sm bg-background/50 border-2 border-primary/30 hover:border-primary/50 shadow-xl"
                    >
                      Sign In
                    </Button>
                  </motion.div>
                </Interactive3DCard>
              </>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Powerful Features
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for collaborative shopping, built with modern
              technology and beautiful design.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group"
              >
                <Interactive3DCard className="h-full">
                  <motion.div whileHover={{ y: -10 }} className="h-full">
                    <Card className="h-full border-2 border-transparent hover:border-primary/20 transition-all duration-300 backdrop-blur-sm bg-card/80 shadow-xl hover:shadow-2xl">
                      <CardContent className="p-6 relative overflow-hidden">
                        {/* Animated background gradient */}
                        <motion.div
                          animate={{
                            opacity: [0, 0.1, 0],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0,
                          }}
                          className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} blur-xl`}
                        />

                        <div className="relative z-10">
                          <motion.div
                            variants={floatingVariants}
                            animate="float"
                            style={{ animationDelay: "0s" }}
                            className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                          >
                            <feature.icon
                              className={`h-6 w-6 ${feature.color} drop-shadow-sm`}
                            />
                          </motion.div>
                          <h4 className="text-xl font-semibold text-foreground mb-2">
                            {feature.title}
                          </h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </div>

                        {/* Shine effect on hover */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
                          whileHover={{
                            translateX: "200%",
                          }}
                          transition={{
                            duration: 0.8,
                            ease: "easeOut",
                          }}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                </Interactive3DCard>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Advanced Features */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/10"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants} className="mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Advanced Capabilities
            </h3>
            <p className="text-lg text-muted-foreground">
              Built for power users who demand the best collaborative experience
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {advancedFeatures.map((feature) => (
              <motion.div
                key={feature}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 p-4 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50"
              >
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">
                  {feature}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced CTA Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div variants={itemVariants}>
            <motion.h3
              className="text-4xl font-bold text-foreground mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "200% 200%",
              }}
            >
              Ready to Transform Your Shopping?
            </motion.h3>
            <motion.p
              className="text-xl text-muted-foreground mb-8"
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Join thousands of users who&apos;ve already discovered the joy of
              collaborative shopping with CartMate.
            </motion.p>
            {!isSignedIn && (
              <Interactive3DCard>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => router.push("/sign-up")}
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 shadow-2xl border-0 relative overflow-hidden"
                  >
                    <motion.div
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                    <span className="relative z-10 flex items-center">
                      Start Shopping Together
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Heart className="ml-2 h-5 w-5 text-red-400" />
                      </motion.div>
                    </span>
                  </Button>
                </motion.div>
              </Interactive3DCard>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border/50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            Made with <Heart className="h-4 w-4 inline text-red-500" /> using
            Next.js, Tailwind CSS, and Framer Motion
          </p>
        </div>
      </footer>
    </div>
  );
}
