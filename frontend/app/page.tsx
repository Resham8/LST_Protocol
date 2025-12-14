"use client";
import StakingCard from "@/components/staking-card";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-[oklch(0.16_0.06_180)] via-[oklch(0.18_0.05_170)] to-[oklch(0.15_0.07_160)] flex items-center justify-center p-4">
      <StakingCard/>
    </div>
  );
}
