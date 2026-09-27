import { Cta } from '@/components/sections/Cta';
import { Developers } from '@/components/sections/Developers';
import { Footer } from '@/components/sections/Footer';
import { Hero } from '@/components/sections/Hero';
import { Intro } from '@/components/sections/Intro';
import { Marquee } from '@/components/sections/Marquee';
import { Nav } from '@/components/sections/Nav';
import { Split } from '@/components/sections/Split';
import { Stories } from '@/components/sections/Stories';
import { Modules } from '@/components/sections/Modules';
import { Tiers } from '@/components/sections/Tiers';

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Split />
        <Intro />
        <Modules />
        <Tiers />
        <Stories />
        <Developers />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
