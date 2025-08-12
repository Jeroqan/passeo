import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import { redirect, notFound } from "next/navigation";
import MultiStepContentGeneration from "../MultiStepContentGeneration";

// Geçerli step'ler (4. adım geçici olarak pasif)
const validSteps = [
  'product-info',
  'keyword-analysis', 
  'content-creation'
  // 'final-touches' - Geçici olarak pasif
];

// Step'ten index'e çevirme
const stepToIndex = {
  'product-info': 0,
  'keyword-analysis': 1,
  'content-creation': 2
  // 'final-touches': 3 - Geçici olarak pasif
};

interface StepPageProps {
  params: {
    step: string;
  };
}

export default async function StepPage({ params }: StepPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const { step } = params;

  // Geçersiz step kontrolü
  if (!validSteps.includes(step)) {
    notFound();
  }

  // Step index'ini belirle
  const stepIndex = stepToIndex[step as keyof typeof stepToIndex];

  return <MultiStepContentGeneration initialStep={stepIndex} />;
}

// Statik path'ler için (SEO optimizasyonu)
export function generateStaticParams() {
  return validSteps.map((step) => ({
    step,
  }));
} 