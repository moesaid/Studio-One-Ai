'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GoogleIcon, StudioOneLogo } from '@/components/shared/icons';
import { useAuth } from '@/features/auth';

/* ─── Smooth mouse-tracking spotlight ─── */
function InteractiveBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const smoothX = useSpring(mouseX, { damping: 40, stiffness: 150 });
  const smoothY = useSpring(mouseY, { damping: 40, stiffness: 150 });

  const spotlightX = useTransform(smoothX, [0, 1], ['20%', '80%']);
  const spotlightY = useTransform(smoothY, [0, 1], ['20%', '80%']);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Primary mouse-following spotlight */}
      <motion.div
        className="absolute h-[600px] w-[600px] rounded-full"
        style={{
          left: spotlightX,
          top: spotlightY,
          x: '-50%',
          y: '-50%',
          background:
            'radial-gradient(circle, rgba(251,191,36,0.06) 0%, rgba(251,191,36,0.02) 40%, transparent 70%)',
        }}
      />

      {/* Static ambient orbs */}
      <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-amber-500/[0.03] blur-[100px]" />
      <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-sky-500/[0.03] blur-[100px]" />

      {/* SVG grid pattern */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.03]">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Subtle horizontal film lines */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="absolute left-0 right-0 top-[25%] h-px bg-gradient-to-r from-transparent via-white to-transparent" />
        <div className="absolute left-0 right-0 top-[50%] h-px bg-gradient-to-r from-transparent via-white to-transparent" />
        <div className="absolute left-0 right-0 top-[75%] h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      </div>
    </div>
  );
}

/* ─── Container animation variants ─── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: 'easeOut' as const },
  },
};

export default function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/studio');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#09090b]">
        <motion.div
          className="h-6 w-6 rounded-full border-2 border-amber-400/20 border-t-amber-400"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-[#09090b]">
      <InteractiveBackground />

      {/* Vertical accent lines */}
      <div className="pointer-events-none absolute bottom-0 left-[72px] top-0 hidden w-px bg-gradient-to-b from-transparent via-white/[0.04] to-transparent lg:block" />
      <div className="pointer-events-none absolute bottom-0 right-[72px] top-0 hidden w-px bg-gradient-to-b from-transparent via-white/[0.04] to-transparent lg:block" />

      <motion.div
        className="relative z-10 flex w-full max-w-[380px] flex-col items-center gap-12 px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Logo ── */}
        <motion.div className="flex flex-col items-center gap-6" variants={itemVariants}>
          <div className="relative">
            <div className="absolute -inset-3 rounded-3xl bg-amber-400/[0.06] blur-xl" />
            <div className="relative">
              <StudioOneLogo size={56} />
            </div>
          </div>

          <div className="space-y-2.5 text-center">
            <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-white">
              Studio One{' '}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                AI
              </span>
            </h1>
            <p className="text-[15px] leading-relaxed text-white/50">
              Your AI Director awaits. Sign in to
              <br />
              bring your stories to the screen.
            </p>
          </div>
        </motion.div>

        {/* ── Login card ── */}
        <motion.div className="w-full" variants={itemVariants}>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 backdrop-blur-2xl">
            <Button
              className="h-[52px] w-full gap-3 rounded-xl border-white/[0.08] bg-white/[0.04] text-[15px] font-medium text-white/90 transition-all duration-300 ease-out hover:border-amber-400/20 hover:bg-white/[0.08] hover:shadow-[0_0_30px_rgba(251,191,36,0.05)] active:opacity-80"
              size="lg"
              variant="outline"
              onClick={signIn}
            >
              <GoogleIcon className="h-[18px] w-[18px]" />
              Continue with Google
            </Button>

            <div className="mt-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.05]" />
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/30">
                secure sign-in
              </span>
              <div className="h-px flex-1 bg-white/[0.05]" />
            </div>

            <p className="mt-4 text-center text-[11px] leading-[1.6] text-white/35">
              By continuing, you agree to our Terms of Service
              <br />
              and acknowledge our Privacy Policy.
            </p>
          </div>
        </motion.div>

        {/* ── Footer ── */}
        <motion.div
          className="flex items-center gap-2.5"
          variants={itemVariants}
        >
          <div className="h-[3px] w-[3px] rounded-full bg-amber-400/25" />
          <span className="text-[10px] font-medium tracking-[0.2em] text-white/25">
            POWERED BY GEMINI
          </span>
          <div className="h-[3px] w-[3px] rounded-full bg-amber-400/25" />
        </motion.div>
      </motion.div>
    </main>
  );
}
