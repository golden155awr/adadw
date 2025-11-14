// Enhanced, more alive, more animated version of your Landing Page
// Includes smoother animations, parallax layers, particle bursts, floating elements, hover magnetism, and scroll-based effects.
// NOTE: Replace your current file with this for maximum effect.

import { Shield, Globe, Lock, Zap, CheckCircle, ArrowRight, GraduationCap, Building2, Users } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

interface LandingPageProps {
  onGetStarted: () => void;
}

/******************** 🔢 ANIMATED COUNTER ************************/ 
function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setCount(Math.floor(progress * target));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, target, duration]);

  return <div ref={ref}>{count}</div>;
}

/******************** 🌌 NEW IMPROVED PARTICLE BACKGROUND ************************/ 
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const particles: any[] = [];

    const createParticle = () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.4 + 0.3,
      hue: Math.floor(Math.random() * 360)
    });

    for (let i = 0; i < 80; i++) particles.push(createParticle());

    const animate = () => {
      ctx.clearRect(0, 0, W, H);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > W) p.speedX *= -1;
        if (p.y < 0 || p.y > H) p.speedY *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-60" />;
}

/******************** MAIN COMPONENT ************************/ 
export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const fadeOut = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const scaleOut = useTransform(scrollYProgress, [0, 0.25], [1, 0.9]);

  const [gradientPosition, setGradientPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      setGradientPosition(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/*************** 🌈 Animated Gradient Hero Container ***************/}
      <motion.div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(${gradientPosition * 200}deg, rgb(230, 245, 255), rgb(255,255,255) ${50 + gradientPosition * 40}%, rgb(245,246,255))`
        }}
      >
        <ParticleBackground />

        {/*************** HERO ***************/}
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10"
          style={{ opacity: fadeOut, scale: scaleOut }}
        >
          <div className="text-center">
            <motion.div
              className="flex justify-center mb-8"
              initial={{ scale: 0, rotate: -270 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            >
              <motion.div
                className="p-4 bg-white rounded-2xl shadow-xl border-2 border-blue-600"
                whileHover={{ scale: 1.15, rotate: 6 }}
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9SDhWvIaGwyyoH9wENFZ4EFEqQCr4UXIVjw&s"
                  alt="CredSphere Logo"
                  className="w-20 h-20 rounded-xl object-cover"
                />
              </motion.div>
            </motion.div>

            <motion.h1
              className="text-6xl font-extrabold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              CredSphere
              <motion.span
                className="block text-blue-600 mt-3"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                On the Blockchain
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              A decentralized platform enabling instant, tamper-proof academic credential verification using Ethereum Sepolia.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                onClick={onGetStarted}
                className="px-10 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-2xl flex items-center"
              >
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </button>

              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition"
              >
                Learn More
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/*************** FLOATING COLOR BLOBS ***************/}
        <motion.div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20" style={{ y: backgroundY }}>
          <motion.div className="absolute top-10 left-10 w-80 h-80 bg-blue-400 rounded-full blur-3xl animate-pulse" />
          <motion.div className="absolute top-60 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl animate-pulse" />
          <motion.div className="absolute bottom-10 left-1/2 w-72 h-72 bg-green-400 rounded-full blur-3xl animate-pulse" />
        </motion.div>
      </motion.div>

      {/*************** FEATURES SECTION ***************/}
      <div id="features" className="py-24 bg-white relative overflow-hidden">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Why Choose Our Platform?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Next-gen verification powered by decentralization</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            { icon: Shield, title: 'Immutable Security', color: 'blue', delay: 0 },
            { icon: Zap, title: 'Instant Verification', color: 'green', delay: 0.1 },
            { icon: Globe, title: 'Global Interoperability', color: 'purple', delay: 0.2 },
            { icon: Lock, title: 'Privacy Protected', color: 'orange', delay: 0.3 },
            { icon: Users, title: 'Lifelong Ownership', color: 'teal', delay: 0.4 },
            { icon: CheckCircle, title: 'Tamper-Proof Records', color: 'red', delay: 0.5 }
          ].map(({ icon: Icon, title, color, delay }) => (
            <motion.div
              key={title}
              className={`p-8 rounded-2xl border shadow-lg backdrop-blur bg-white/80 hover:shadow-2xl hover:-translate-y-2 transition group border-${color}-200`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay, duration: 0.6 }}
            >
              <motion.div
                className={`w-14 h-14 bg-${color}-600 rounded-xl flex items-center justify-center mb-6`}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Icon className="w-7 h-7 text-white" />
              </motion.div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
              <p className="text-gray-600">Blockchain-based permanent, secure, global, auditable credential verification.</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/*************** COUNTERS ***************/}
      <motion.div className="py-20 bg-gray-50" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          {[
            { target: 100, label: 'Blockchain Security', color: 'blue' },
            { target: 99, label: 'Uptime Guarantee', color: 'green' },
            { target: 0, label: 'Data Breaches', color: 'purple' }
          ].map(({ target, label, color }, i) => (
            <motion.div key={label} initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.2 }}>
              <div className={`text-4xl font-bold text-${color}-600 mb-2`}><AnimatedCounter target={target} />{i === 2 ? '+' : '%'}</div>
              <p className="text-gray-600">{label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
