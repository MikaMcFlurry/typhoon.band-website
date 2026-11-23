"use client";

import Link from "next/link";
import { useDict } from "@/components/i18n/DictProvider";
import { Icon } from "@/components/ui/Icon";

export function NotFoundView() {
  const { dict, locale } = useDict();
  return (
    <section className="shell flex min-h-[70svh] flex-col items-start justify-center pb-24 pt-[calc(var(--header-h)+48px)]">
      <h1 className="h-stage max-w-[16ch]">{dict.notFound.title}</h1>
      <p className="copy-lg mt-6">{dict.notFound.body}</p>
      {/* Orange stays reserved for booking; home is the chalk outline. */}
      <div className="mt-10 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
        <Link className="btn-line" href={`/${locale}`}>
          <Icon name="arrow-left" size={18} />
          {dict.notFound.cta}
        </Link>
        <Link className="btn-tape" href={`/${locale}#booking`}>
          {dict.hero.ctaBook}
          <Icon name="arrow-right" size={20} />
        </Link>
      </div>
    </section>
  );
}
