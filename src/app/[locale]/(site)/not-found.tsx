"use client";

import Link from "next/link";
import { useDict } from "@/components/i18n/DictProvider";
import { Icon } from "@/components/ui/Icon";

export default function NotFound() {
  const { dict, locale } = useDict();
  return (
    <section className="shell flex min-h-[70svh] flex-col items-start justify-center pb-24 pt-[calc(var(--header-h)+48px)]">
      <p className="mono-cap">
        <span className="tape tape-blue !px-2 !py-1">404</span>
      </p>
      <h1 className="h-stage mt-6 max-w-[16ch]">{dict.notFound.title}</h1>
      <p className="copy-lg mt-6">{dict.notFound.body}</p>
      <Link className="btn-tape mt-10" href={`/${locale}`}>
        <Icon name="arrow-left" size={18} />
        {dict.notFound.cta}
      </Link>
    </section>
  );
}
