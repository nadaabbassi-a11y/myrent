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
  Plus,
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

export function Navbar() {
  const { user, isLoading, signOut } = useAuth()
  const { language, changeLanguage, t } = useLanguageContext()
  const { notifications } = useNotifications()

  const handleLanguageChange = (newLanguage: string) => {
    changeLanguage(newLanguage as "fr" | "en")
    // Le contexte mettra à jour automatiquement toutes les traductions
  }

  return (
    <nav className="border-b border-neutral-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="group">
            <Logo size="lg" showText={true} />
          </Link>

          <div className="flex items-center gap-8">
            <Link href="/listings" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              {t("common.search")}
            </Link>
            {isLoading ? (
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              <>
                {/* Sélecteur de langue */}
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-24 h-10 border-gray-200 bg-white/80 hover:bg-white hover:border-slate-400 hover:shadow-md transition-all duration-300 rounded-full px-3 font-medium text-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200 shadow-xl">
                    <SelectItem value="fr" className="cursor-pointer hover:bg-slate-50 rounded-lg">
                      Français
                    </SelectItem>
                    <SelectItem value="en" className="cursor-pointer hover:bg-slate-50 rounded-lg">
                      English
                    </SelectItem>
                  </SelectContent>
                </Select>

                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 hover:shadow-md transition-all relative">
                    <Menu className="h-5 w-5 text-gray-700" />
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-semibold text-sm relative shadow-lg">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                      {(notifications.messages + notifications.visitRequests + notifications.applications) > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] border-2 border-white">
                          {(notifications.messages + notifications.visitRequests + notifications.applications) > 99 
                            ? '99+' 
                            : (notifications.messages + notifications.visitRequests + notifications.applications)}
                        </span>
                      )}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  {/* Section Navigation */}
                  {user.role === "LANDLORD" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/landlord/listings/new" className="flex items-center gap-3 w-full">
                          <Plus className="h-5 w-5 text-gray-600" />
                          <span>{t("navbar.createListing")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/landlord/applications" className="flex items-center gap-3 w-full relative">
                          <FileText className="h-5 w-5 text-gray-600" />
                          <span>{t("navbar.applications")}</span>
                          {notifications.applications > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                              {notifications.applications > 99 ? '99+' : notifications.applications}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/landlord/leases" className="flex items-center gap-3 w-full">
                          <FileText className="h-5 w-5 text-gray-600" />
                          <span>{t("navbar.contracts")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/landlord/rent-management" className="flex items-center gap-3 w-full">
                          <DollarSign className="h-5 w-5 text-gray-600" />
                          <span>{t("navbar.rentManagement")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/landlord/visits" className="flex items-center gap-3 w-full relative">
                          <Calendar className="h-5 w-5 text-gray-600" />
                          <span>{t("navbar.visitRequests")}</span>
                          {notifications.visitRequests > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                              {notifications.visitRequests > 99 ? '99+' : notifications.visitRequests}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user.role === "TENANT" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/tenant/favorites" className="flex items-center gap-3 w-full">
                          <Heart className="h-5 w-5 text-gray-600" />
                          <span>{t("navbar.favorites")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/tenant/applications" className="flex items-center gap-3 w-full relative">
                          <FileText className="h-5 w-5 text-gray-600" />
                          <span>{t("navbar.applications")}</span>
                          {notifications.applications > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                              {notifications.applications > 99 ? '99+' : notifications.applications}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/tenant/visits" className="flex items-center gap-3 w-full relative">
                          <Calendar className="h-5 w-5 text-gray-600" />
                          <span>{t("navbar.myVisits")}</span>
                          {notifications.visitRequests > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                              {notifications.visitRequests > 99 ? '99+' : notifications.visitRequests}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/tenant/payments" className="flex items-center gap-3 w-full">
                          <CreditCard className="h-5 w-5 text-gray-600" />
                          <span>{t("navbar.myPayments")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/tenant/leases" className="flex items-center gap-3 w-full">
                          <FileText className="h-5 w-5 text-gray-600" />
                          <span>{t("navbar.leaseTracking")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/tenant/rent-management" className="flex items-center gap-3 w-full">
                          <DollarSign className="h-5 w-5 text-gray-600" />
                          <span>{t("navbar.rentManagement")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/tenant/messages" className="flex items-center gap-3 w-full relative">
                      <MessageSquare className="h-5 w-5 text-gray-600" />
                      <span>{t("navbar.messages")}</span>
                      {notifications.messages > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                          {notifications.messages > 99 ? '99+' : notifications.messages}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={user.role === "TENANT" ? "/tenant/profile" : "/landlord/profile"} className="flex items-center gap-3 w-full">
                      <User className="h-5 w-5 text-gray-600" />
                      <span>{t("navbar.profile")}</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Section Paramètres */}
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-3 w-full">
                      <Settings className="h-5 w-5 text-gray-600" />
                      <span>{t("navbar.accountSettings")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/faq" className="flex items-center gap-3 w-full">
                      <HelpCircle className="h-5 w-5 text-gray-600" />
                      <span>{t("navbar.helpCenter")}</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Section Autres */}
                  <DropdownMenuItem asChild>
                    <Link href="/invite" className="flex items-center gap-3 w-full">
                      <Gift className="h-5 w-5 text-gray-600" />
                      <span>{t("navbar.inviteFriend")}</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Déconnexion */}
                  <DropdownMenuItem
                    onClick={signOut}
                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>{t("common.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <>
                {/* Sélecteur de langue pour utilisateurs non connectés */}
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-24 h-10 border-gray-200 bg-white/80 hover:bg-white hover:border-slate-400 hover:shadow-md transition-all duration-300 rounded-full px-3 font-medium text-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200 shadow-xl">
                    <SelectItem value="fr" className="cursor-pointer hover:bg-slate-50 rounded-lg">
                      Français
                    </SelectItem>
                    <SelectItem value="en" className="cursor-pointer hover:bg-slate-50 rounded-lg">
                      English
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
                    {t("common.login")}
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-slate-700 hover:bg-slate-800 text-white">{t("common.signup")}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

