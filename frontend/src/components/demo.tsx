import Navbar from '@/components/landing/navbar';
import Hero from '@/components/landing/hero';
import Stats from '@/components/landing/stats';
import Features from '@/components/landing/features';
import AnimatedBento from '@/components/landing/animated-bento';
import ComponentsBento from '@/components/landing/component-bento';
import TemplateBento from '@/components/landing/template-bento';
import Testimonial from '@/components/landing/testimonial';
import Footer from '@/components/landing/footer';

export interface Landing01DemoProps {
  onGetStarted?: () => void;
}

export default function Landing01Demo({ onGetStarted }: Landing01DemoProps = {}) {
  return (
    <main className="dark min-h-screen overflow-x-hidden bg-[#101010] text-white">
      <Navbar onGetStarted={onGetStarted} />
      <Hero onGetStarted={onGetStarted} />
      <Stats />
      <Features />
      <AnimatedBento />
      <ComponentsBento />
      <TemplateBento />
      <Testimonial />
      <Footer />
    </main>
  );
}
