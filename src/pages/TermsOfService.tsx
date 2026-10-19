import ReactMarkdown from 'react-markdown'
import terms from '../content/terms.md?raw'
import { useTranslation } from 'react-i18next';
import { Breadcrumbs, type BreadcrumbConfig } from '@/components/BreadCrumbs';
import { HeaderBar } from '@/components/header/HeaderBar';

export function TermsOfService() {
  const { t } = useTranslation();
  const breadcrumbConfig: BreadcrumbConfig = {
    "/admin": {
      label: t("terms", "Terms of Service"),
    },
  }
  return (
    <>
      <HeaderBar
      // title={t("title")}
      // description={t("description")}
      />
      <main className="mx-auto max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-6xl px-4 pt-4 md:pt-16 pb-8 space-y-6">
        <Breadcrumbs
          config={breadcrumbConfig}
        />
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
            {/* Title + subtitle */}
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold tracking-tight text-foreground/90">
                <span className="truncate">{t("common.tos", "Terms of Service")}</span>
              </h2>
            </div>
          </div>
        </div>
        <article className="prose prose-slate max-w-none dark:prose-invert">
          <ReactMarkdown>{terms}</ReactMarkdown>
        </article>
      </main>
    </>
  )
}
