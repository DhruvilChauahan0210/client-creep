import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Problem from "./components/Problem";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import Comparison from "./components/Comparison";
import CISection from "./components/CISection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Problem />
        <HowItWorks />
        <Features />
        <Comparison />
        <CISection />
      </main>
      <Footer />
    </>
  );
}
