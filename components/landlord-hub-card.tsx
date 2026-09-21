import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LandlordHubCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: number;
  highlight?: boolean;
}

export function LandlordHubCard({
  href,
  icon: Icon,
  title,
  description,
  badge,
  highlight,
}: LandlordHubCardProps) {
  return (
    <Link href={href}>
      <Card
        className={`h-full transition-colors cursor-pointer ${
          highlight
            ? "border-ink/20 bg-neutral-50 hover:bg-white"
            : "hover:border-neutral-300"
        }`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-3 text-base font-medium">
            <Icon className="h-4 w-4 text-ink-muted shrink-0" strokeWidth={1.75} />
            <span className="flex-1">{title}</span>
            {badge !== undefined && badge > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ink-muted leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
