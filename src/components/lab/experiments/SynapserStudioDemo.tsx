"use client";

import { SynapserModelProvider } from "./SynapserModelContext";
import SynapserStudioSettings from "./SynapserStudioSettings";
import SynapserStudioScroll from "./SynapserStudioScroll";

export default function SynapserStudioDemo() {
  return (
    <SynapserModelProvider>
      <div className="mx-auto w-full max-w-[900px] px-6 pb-5">
        <SynapserStudioSettings compact />
      </div>
      <SynapserStudioScroll />
    </SynapserModelProvider>
  );
}
