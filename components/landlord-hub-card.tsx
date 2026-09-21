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
        className={`h-full hover:shadow-lg transition-all duration-300 cursor-pointer rounded-xl ${
          highlight
            ? "border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-white hover:bg-neutral-50"
            : "border border-neutral-200 hover:border-neutral-300"
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-medium text-neutral-900 flex-1">{title}</span>
            {badge !== undefined && badge > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 min-w-[24px] px-1.5 flex items-center justify-center">
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600 text-sm leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
