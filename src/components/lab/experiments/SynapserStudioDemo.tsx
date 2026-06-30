"use client";

import { SynapserModelProvider } from "./SynapserModelContext";
import SynapserModelSettings from "./SynapserModelSettings";
import SynapserStudioScroll from "./SynapserStudioScroll";

export default function SynapserStudioDemo() {
  return (
    <SynapserModelProvider>
      <div className="mx-auto w-full max-w-[900px] px-6 pb-5">
        <SynapserModelSettings compact />
      </div>
      <SynapserStudioScroll />
    </SynapserModelProvider>
  );
}
