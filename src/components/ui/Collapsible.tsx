"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { Icon } from "@/components/ui/Icon";

// Shows the first `initial` children and reveals the rest on demand, so the
// one-pager stays compact (owner rule: "preview first, reveal all").
// All items are in the HTML (crawlable); the rest get `!hidden` until
// expanded. Children must be <li> elements.

export function CollapsibleList({
  children,
  initial,
  moreLabel,
  lessLabel,
  className = "",
  as: Tag = "ul",
}: {
  children: ReactNode;
  initial: number;
  moreLabel: string;
  lessLabel: string;
  className?: string;
  as?: "ul" | "ol";
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const items = Children.toArray(children);
  const hiddenCount = Math.max(0, items.length - initial);

  return (
    <>
      <Tag className={className} id={id}>
        {items.map((child, i) => {
          if (i < initial || open || !isValidElement(child)) return child;
          const el = child as ReactElement<{ className?: string }>;
          return cloneElement(el, {
            className: `${el.props.className ?? ""} !hidden`,
          });
        })}
      </Tag>
      {hiddenCount > 0 ? (
        <div className="mt-8 flex justify-center">
          <button
            aria-controls={id}
            aria-expanded={open}
            className="btn btn-secondary"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            {open ? lessLabel : moreLabel}
            <Icon className={`transition-transform ${open ? "rotate-180" : ""}`} name="arrow-down" size={16} />
          </button>
        </div>
      ) : null}
    </>
  );
}
