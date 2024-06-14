"use client";

import { createContext, Dispatch, SetStateAction, useState } from "react";

import Loader from "@/components/Loader";

type LoaderContextType = {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

export const LoaderContext = createContext<LoaderContextType | null>(null);

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {children}
      <Loader loading={loading} />
    </LoaderContext.Provider>
  );
}
