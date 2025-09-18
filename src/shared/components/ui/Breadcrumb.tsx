"use client";
import React from "react";
import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";
import { helpers } from "@/shared/constants/designSystem";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

interface EllipsisItem {
  label: string;
  isEllipsis: true;
}

//type BreadcrumbDisplayItem = BreadcrumbItem | EllipsisItem;

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
  showHome?: boolean;
  maxItems?: number;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className,
  separator = <ChevronRightIcon className="h-4 w-4 text-neutral-400" />,
  showHome = true,
  maxItems = 5,
}) => {
  // Add home item if showHome is true and not already present
  const allItems = React.useMemo(() => {
    const itemsWithHome =
      showHome && !items.some((item) => item.href === "/")
        ? [
            {
              label: "Home",
              href: "/",
              icon: <HomeIcon className="h-4 w-4" />,
            },
            ...items,
          ]
        : items;

    // Handle overflow with ellipsis
    if (itemsWithHome.length > maxItems) {
      const start = itemsWithHome.slice(0, 1); // Always show first item (usually Home)
      const end = itemsWithHome.slice(-2); // Always show last 2 items
      const middle = itemsWithHome.slice(1, -2);

      if (middle.length > 0) {
        return [
          ...start,
          { label: "...", isEllipsis: true } as EllipsisItem,
          ...end,
        ];
      }
    }

    return itemsWithHome;
  }, [items, showHome, maxItems]);

  return (
    <nav
      aria-label="Breadcrumb"
      className={helpers.cn("flex items-center space-x-1 text-sm", className)}
    >
      <ol className="flex items-center space-x-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isEllipsis = "isEllipsis" in item && item.isEllipsis;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 flex-shrink-0" aria-hidden="true">
                  {separator}
                </span>
              )}

              {isEllipsis ? (
                <span className="text-neutral-500 px-2">{item.label}</span>
              ) : isLast || !(item as BreadcrumbItem).href ? (
                <span
                  className={helpers.cn(
                    "flex items-center space-x-1 font-medium",
                    isLast
                      ? "text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-600 dark:text-neutral-300"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {(item as BreadcrumbItem).icon && (
                    <span className="flex-shrink-0">
                      {(item as BreadcrumbItem).icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </span>
              ) : (
                <Link
                  href={(item as BreadcrumbItem).href!}
                  className={helpers.cn(
                    "flex items-center space-x-1 text-neutral-600 dark:text-neutral-300",
                    "hover:text-blue-600 dark:hover:text-blue-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    "dark:focus:ring-blue-400 dark:focus:ring-offset-neutral-900",
                    "rounded px-1 py-0.5 transition-colors duration-200"
                  )}
                >
                  {(item as BreadcrumbItem).icon && (
                    <span className="flex-shrink-0">
                      {(item as BreadcrumbItem).icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Convenient hook for building breadcrumb items
export const useBreadcrumbs = () => {
  const buildBreadcrumbs = React.useCallback(
    (
      pathSegments: Array<{
        label: string;
        href?: string;
        icon?: React.ReactNode;
      }>
    ): BreadcrumbItem[] => {
      return pathSegments.map((segment, index) => ({
        ...segment,
        isActive: index === pathSegments.length - 1,
      }));
    },
    []
  );

  return { buildBreadcrumbs };
};

export default Breadcrumb;
