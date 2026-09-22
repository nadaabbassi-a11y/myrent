"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useAuth } from "@/hooks/useAuth"
import { useLanguageContext } from "@/contexts/LanguageContext"
import { useNotifications } from "@/hooks/useNotifications"
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
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function LanguageSelect({
  language,
  onChange,
  compact = false,
}: {
  language: string
  onChange: (lang: string) => void
  compact?: boolean
}) {
  return (
    <Select value={language} onValueChange={onChange}>
      <SelectTrigger
        className={
          compact
            ? "w-full h-10 border-neutral-200 bg-white font-light text-sm"
            : "w-32 h-10 border-neutral-200 bg-white hover:border-neutral-300 font-light text-sm text-neutral-700"
        }
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-neutral-200">
        <SelectItem value="fr">Français</SelectItem>
        <SelectItem value="en">English</SelectItem>
      </SelectContent>
    </Select>
  )
}

export function Navbar() {
  const { user, isLoading, signOut } = useAuth()
  const { language, changeLanguage, t } = useLanguageContext()
  const { notifications } = useNotifications()

  const handleLanguageChange = (newLanguage: string) => {
    changeLanguage(newLanguage as "fr" | "en")
  }

  const notifCount =
    notifications.messages + notifications.visitRequests + notifications.applications

  const userMenuContent = (
    <>
      <div className="px-4 pt-4 pb-3 border-b border-neutral-100">
        <p className="text-sm font-light text-neutral-500 mb-1">Bienvenu</p>
        <p className="text-lg font-light text-neutral-900 truncate">
          {user?.name || user?.email.split("@")[0]}
        </p>
      </div>

      <div className="px-4 py-4 border-b border-neutral-100 lg:hidden">
        <LanguageSelect language={language} onChange={handleLanguageChange} compact />
      </div>

      <DropdownMenuItem asChild>
        <Link
          href={user?.role === "TENANT" ? "/tenant/profile" : "/landlord/profile"}
          className="flex items-center gap-4 w-full py-3"
        >
          <User className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
          <span className="text-base font-light">{t("navbar.profile")}</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link
          href={user?.role === "LANDLORD" ? "/landlord/messages" : "/tenant/messages"}
          className="flex items-center gap-4 w-full relative py-3"
        >
          <MessageSquare className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
          <span className="text-base font-light">{t("navbar.messages")}</span>
          {notifications.messages > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {notifications.messages > 99 ? "99+" : notifications.messages}
            </span>
          )}
        </Link>
      </DropdownMenuItem>

      {user?.role === "LANDLORD" && (
        <>
          <DropdownMenuItem asChild>
            <Link href="/landlord/advertise" className="flex items-center gap-4 w-full py-3">
              <Home className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
              <span className="text-base font-light">{t("landlordNav.advertise")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/landlord/paperwork" className="flex items-center gap-4 w-full relative py-3">
              <FileText className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
              <span className="text-base font-light">{t("landlordNav.paperwork")}</span>
              {notifications.applications > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.applications > 99 ? "99+" : notifications.applications}
                </span>
              )}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/landlord/management" className="flex items-center gap-4 w-full py-3">
              <DollarSign className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
              <span className="text-base font-light">{t("landlordNav.management")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      )}

      {user?.role === "TENANT" && (
        <>
          <DropdownMenuItem asChild>
            <Link href="/tenant/favorites" className="flex items-center gap-4 w-full py-3">
              <Heart className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
              <span className="text-base font-light">{t("navbar.favorites")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tenant/applications" className="flex items-center gap-4 w-full relative py-3">
              <FileText className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
              <span className="text-base font-light">{t("navbar.applications")}</span>
              {notifications.applications > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.applications > 99 ? "99+" : notifications.applications}
                </span>
              )}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tenant/visits" className="flex items-center gap-4 w-full relative py-3">
              <Calendar className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
              <span className="text-base font-light">{t("navbar.myVisits")}</span>
              {notifications.visitRequests > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.visitRequests > 99 ? "99+" : notifications.visitRequests}
                </span>
              )}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tenant/payments" className="flex items-center gap-4 w-full py-3">
              <CreditCard className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
              <span className="text-base font-light">{t("navbar.myPayments")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tenant/leases" className="flex items-center gap-4 w-full py-3">
              <FileText className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
              <span className="text-base font-light">{t("navbar.leaseTracking")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tenant/rent-management" className="flex items-center gap-4 w-full py-3">
              <DollarSign className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
              <span className="text-base font-light">{t("navbar.rentManagement")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      )}

      <DropdownMenuItem asChild>
        <Link href="/settings" className="flex items-center gap-4 w-full py-3">
          <Settings className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
          <span className="text-base font-light">{t("navbar.accountSettings")}</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/faq" className="flex items-center gap-4 w-full py-3">
          <HelpCircle className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
          <span className="text-base font-light">{t("navbar.helpCenter")}</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/invite" className="flex items-center gap-4 w-full py-3">
          <Gift className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
          <span className="text-base font-light">{t("navbar.inviteFriend")}</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={signOut}
        className="text-red-600 focus:text-red-700 focus:bg-red-50 py-3"
      >
        <LogOut className="h-5 w-5 mr-4" strokeWidth={1.5} />
        <span className="text-base font-light">{t("common.logout")}</span>
      </DropdownMenuItem>
    </>
  )

  return (
    <nav className="border-b border-neutral-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3.5 md:py-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="group shrink-0 min-w-0">
            <Logo size="md" showText={true} />
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link
              href="/#piliers"
              className="text-sm font-light text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {t("home.forLandlords")}
            </Link>
            <Link
              href="/listings"
              className="text-sm font-light text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {t("home.heroSecondary")}
            </Link>

            {isLoading ? (
              <div className="w-20 h-9 bg-neutral-200 animate-pulse rounded" />
            ) : user ? (
              <>
                <LanguageSelect language={language} onChange={handleLanguageChange} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-neutral-200 hover:border-neutral-300 transition-colors relative">
                      <div className="h-9 w-9 rounded-full bg-neutral-800 flex items-center justify-center text-white text-sm font-medium">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      {notifCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                          {notifCount > 99 ? "99+" : notifCount}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    {userMenuContent}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <LanguageSelect language={language} onChange={handleLanguageChange} />
                <Link href="/auth/signin">
                  <Button variant="ghost" className="text-sm font-light text-neutral-700 hover:text-neutral-900 h-10 px-4">
                    {t("common.login")}
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-light h-10 px-5">
                    {t("common.signup")}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <div className="lg:hidden shrink-0">
            {isLoading ? (
              <div className="w-9 h-9 bg-neutral-200 animate-pulse rounded-lg" />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center justify-center h-10 w-10 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors relative"
                    aria-label="Menu"
                  >
                    {user ? (
                      <>
                        <div className="h-7 w-7 rounded-full bg-neutral-800 flex items-center justify-center text-white text-xs font-medium">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                        {notifCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white">
                            {notifCount > 9 ? "9+" : notifCount}
                          </span>
                        )}
                      </>
                    ) : (
                      <Menu className="h-5 w-5 text-neutral-700" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[min(100vw-2rem,20rem)]">
                  {user ? (
                    userMenuContent
                  ) : (
                    <>
                      <DropdownMenuLabel className="font-light text-neutral-500">
                        Navigation
                      </DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href="/#piliers" className="w-full py-2.5 font-light">
                          {t("home.forLandlords")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/listings" className="w-full py-2.5 font-light">
                          {t("home.heroSecondary")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/beta" className="w-full py-2.5 font-light">
                          {t("home.ctaSecondary")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-2">
                        <LanguageSelect language={language} onChange={handleLanguageChange} compact />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/auth/signin" className="w-full py-2.5 font-light">
                          {t("common.login")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/auth/signup"
                          className="w-full py-2.5 font-medium text-neutral-900"
                        >
                          {t("common.signup")}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
