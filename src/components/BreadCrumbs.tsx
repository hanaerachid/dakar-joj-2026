// components/Breadcrumbs.tsx

import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export type BreadcrumbConfig = Record<
  string,
  {
    label: string
  }
>

type Props = {
  config?: BreadcrumbConfig
}

export function Breadcrumbs({ config = {} }: Props) {
  const location = useLocation()
  const { t } = useTranslation()
  const segments = location.pathname
    .split("/")
    .filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link to="/" />}>
            {t("map", "Map")}
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const href =
            "/" + segments.slice(0, index + 1).join("/")

          const label =
            config[href]?.label ??
            formatSegment(segment)

          const isLast = index === segments.length - 1

          return (
            <BreadcrumbItem key={href}>
              <BreadcrumbSeparator />

              {isLast ? (
                <BreadcrumbPage>
                  {label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link to={href} />}>
                  {label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function formatSegment(segment: string) {
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
