import type { ServerFunctionClient } from "payload";
import config from "@payload-config";
import "@payloadcms/next/css";
import "./admin-theme.css";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import { Plus_Jakarta_Sans } from "next/font/google";
import React from "react";

import { importMap } from "./admin/importMap.js";
import { PasswordEyeToggle } from "@/components/admin/PasswordEyeToggle";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-amcham-ui",
  display: "swap",
});

type Args = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    <div className={jakarta.variable}>
      <PasswordEyeToggle />
      {children}
    </div>
  </RootLayout>
);

export default Layout;
