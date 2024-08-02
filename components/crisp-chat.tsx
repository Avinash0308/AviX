"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("b4f9ddc0-dc79-44a7-acab-1e07208f8086");
  }, []);

  return null;
};
