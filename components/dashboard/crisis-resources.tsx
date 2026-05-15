"use client";

import { useState } from "react";
import { Heart, ChevronDown } from "lucide-react";

export function CrisisResources() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="px-4 py-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <Heart className="w-3 h-3 flex-shrink-0" />
        <span>Need to talk? <span className="font-medium">988</span> | Text <span className="font-medium">741741</span></span>
        <ChevronDown className={`w-3 h-3 ml-auto transition-transform ${expanded ? "" : "-rotate-90"}`} />
      </button>

      {expanded && (
        <div className="mt-2 space-y-2 text-xs text-muted-foreground pl-5">
          <div>
            <p className="font-medium text-foreground">988 Suicide & Crisis Lifeline</p>
            <p>Call or text <span className="font-medium">988</span> — 24/7, free & confidential</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Crisis Text Line</p>
            <p>Text <span className="font-medium">HOME</span> to <span className="font-medium">741741</span></p>
          </div>
          <div>
            <p className="font-medium text-foreground">Cancer Support Helpline</p>
            <p>Call <span className="font-medium">1-800-227-2345</span> (American Cancer Society)</p>
          </div>
        </div>
      )}
    </div>
  );
}
