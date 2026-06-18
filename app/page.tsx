"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/store";
import { Loading } from "@/components/ui";

export default function Home() {
  const router = useRouter();
  const { onboarded } = useProfile();
  useEffect(() => {
    router.replace(onboarded ? "/dashboard" : "/onboarding");
  }, [onboarded, router]);
  return <Loading label="Loading WealthLens…" />;
}
