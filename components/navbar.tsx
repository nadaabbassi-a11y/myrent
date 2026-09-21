"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { useAuth } from "@/hooks/useAuth";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { useNotifications } from "@/hooks/useNotifications";
import {
  User,
  LogOut,
  Heart,
  Home,
  MessageSquare,
  Settings,
  HelpCircle,
  Gift,
  Menu,
  FileText,
  Calendar,
  CreditCard,
  DollarSign,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Navbar() {
  const { user, isLoading, signOut } = useAuth();
  const { language, changeLanguage, t } = useLanguageContext();
  const { notifications } = useNotifications();

  const notifCount =
    notifications.messages + notifications.visitRequests + notifications.applications;

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/">
          <Logo size="sm" />
        </Link>

        <div className="flex items-center gap-4">
          {!user && (
            <>
              <Link
                href="/#piliers"
                className="hidden sm:block text-sm text-ink-muted hover:text-ink transition-colors"
              >
                {t("home.forLandlords")}
              </Link>
              <Link
                href="/listings"
                className="hidden sm:block text-sm text-ink-muted hover:text-ink transition-colors"
              >
                {t("home.heroSecondary")}
              </Link>
            </>
          )}

          <Select value={language} onValueChange={(v) => changeLanguage(v as "fr" | "en")}>
            <SelectTrigger className="w-[72px] h-8 border-neutral-200 text-xs font-medium rounded-md px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-md">
              <SelectItem value="fr">FR</SelectItem>
              <SelectItem value="en">EN</SelectItem>
            </SelectContent>
          </Select>

          {isLoading ? (
            <div className="w-16 h-8 bg-neutral-100 animate-pulse rounded-md" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-md border border-neutral-200 hover:bg-neutral-50 transition-colors">
                  <Menu className="h-4 w-4 text-ink-muted" />
                  <div className="h-7 w-7 rounded-md bg-ink text-white text-xs font-medium flex items-center justify-center relative">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                    {notifCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white">
                        {notifCount > 99 ? "99+" : notifCount}
                      </span>
                    )}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-md">
                <div className="px-3 py-2 border-b border-neutral-100">
                  <p className="text-xs text-ink-subtle truncate">{user.email}</p>
                </div>

                <DropdownMenuItem asChild>
                  <Link href={user.role === "TENANT" ? "/tenant/profile" : "/landlord/profile"} className="text-sm">
                    <User className="h-4 w-4 mr-2 text-ink-muted" strokeWidth={1.5} />
                    {t("navbar.profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={user.role === "LANDLORD" ? "/landlord/messages" : "/tenant/messages"}
                    className="text-sm"
                  >
                    <MessageSquare className="h-4 w-4 mr-2 text-ink-muted" strokeWidth={1.5} />
                    {t("navbar.messages")}
                  </Link>
                </DropdownMenuItem>

                {user.role === "LANDLORD" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/landlord/advertise" className="text-sm">
                        <Home className="h-4 w-4 mr-2 text-ink-muted" strokeWidth={1.5} />
                        {t("landlordNav.advertise")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/landlord/paperwork" className="text-sm">
                        <FileText className="h-4 w-4 mr-2 text-ink-muted" strokeWidth={1.5} />
                        {t("landlordNav.paperwork")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/landlord/management" className="text-sm">
                        <DollarSign className="h-4 w-4 mr-2 text-ink-muted" strokeWidth={1.5} />
                        {t("landlordNav.management")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {user.role === "TENANT" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/tenant/favorites" className="text-sm">
                        <Heart className="h-4 w-4 mr-2 text-ink-muted" strokeWidth={1.5} />
                        {t("navbar.favorites")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/tenant/applications" className="text-sm">
                        <FileText className="h-4 w-4 mr-2 text-ink-muted" strokeWidth={1.5} />
                        {t("navbar.applications")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/tenant/visits" className="text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-ink-muted" strokeWidth={1.5} />
                        {t("navbar.myVisits")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/tenant/payments" className="text-sm">
                        <CreditCard className="h-4 w-4 mr-2 text-ink-muted" strokeWidth={1.5} />
                        {t("navbar.myPayments")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem asChild>
                  <Link href="/settings" className="text-sm">
                    <Settings className="h-4 w-4 mr-2 text-ink-muted" strokeWidth={1.5} />
                    {t("navbar.accountSettings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/faq" className="text-sm">
                    <HelpCircle className="h-4 w-4 mr-2 text-ink-muted" strokeWidth={1.5} />
                    {t("navbar.helpCenter")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/invite" className="text-sm">
                    <Gift className="h-4 w-4 mr-2 text-ink-muted" strokeWidth={1.5} />
                    {t("navbar.inviteFriend")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-red-600 text-sm">
                  <LogOut className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  {t("common.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm" className="text-sm h-8 px-3">
                  {t("common.login")}
                </Button>
              </Link>
              <Link href="/auth/signup?role=LANDLORD">
                <Button size="sm" className="bg-ink hover:bg-ink/90 text-white text-sm h-8 px-4">
                  {t("common.signup")}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
