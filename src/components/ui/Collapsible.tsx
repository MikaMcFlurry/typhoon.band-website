"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { Icon } from "@/components/ui/Icon";

// Shows the first `initial` children and reveals the rest on demand, so the
// one-pager stays compact (owner rule: "preview first, reveal all").
// All items are in the HTML (crawlable). CSS hides the extra items when the
// browser runs scripts (see globals.css: `@media (scripting: enabled)`), so
// visitors without JavaScript see everything and no toggle. Children must be
// <li> elements (or components that forward `data-extra` to their <li>).

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
  // Fallback for browsers without the `scripting` media feature. Set on every
  // mount: a locale switch re-creates <html> and drops the attribute.
  useEffect(() => {
    document.documentElement.setAttribute("data-js", "");
  }, []);
  const items = Children.toArray(children);
  const hiddenCount = Math.max(0, items.length - initial);

  return (
    <>
      <Tag className={className} data-collapsed={open ? undefined : "true"} id={id}>
        {items.map((child, i) => {
          if (i < initial || !isValidElement(child)) return child;
          return cloneElement(child as ReactElement<Record<string, unknown>>, {
            "data-extra": "",
          });
        })}
      </Tag>
      {hiddenCount > 0 ? (
        <div className="collapsible-toggle mt-8 flex justify-center">
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
