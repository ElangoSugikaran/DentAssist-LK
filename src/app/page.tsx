import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import WhatToAsk from '@/components/landing/WhatToAsk';
import PricingSection from '@/components/landing/PricingSection';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  // Check if user is already logged in
  const user = await currentUser();

  // Redirect to dashboard if user is logged in (webhook handles sync)
  if (user) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <HowItWorks />
      <WhatToAsk />
      <PricingSection />
      <CTA />
      <Footer />
    </div>
  );
}
