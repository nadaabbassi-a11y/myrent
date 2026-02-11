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
  Zap,
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
      <div className="container mx-auto px-8 py-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="group">
            <Logo size="lg" showText={true} />
          </Link>

          <div className="flex items-center gap-10">
            <Link href="/listings" className="text-base font-light text-neutral-600 hover:text-neutral-900 transition-colors">
              {t("common.search")}
            </Link>
            {isLoading ? (
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              <>
                {/* Sélecteur de langue */}
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-32 h-12 border-gray-200 bg-white/80 hover:bg-white hover:border-slate-400 hover:shadow-md transition-all duration-300 rounded-full px-4 font-light text-base text-gray-700">
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
                  <button className="flex items-center gap-3 px-4 py-3 rounded-full border border-gray-300 hover:shadow-md transition-all relative">
                    <Menu className="h-6 w-6 text-gray-700" />
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-semibold text-base relative shadow-lg">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                      {(notifications.messages + notifications.visitRequests + notifications.applications) > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px] border-2 border-white">
                          {(notifications.messages + notifications.visitRequests + notifications.applications) > 99 
                            ? '99+' 
                            : (notifications.messages + notifications.visitRequests + notifications.applications)}
                        </span>
                      )}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  {/* Section Bienvenue */}
                  <div className="px-4 pt-4 pb-3 border-b border-neutral-100">
                    <p className="text-sm font-light text-neutral-500 mb-1">
                      Bienvenu
                    </p>
                    <p className="text-lg font-light text-neutral-900 truncate">
                      {user.name || user.email.split('@')[0]}
                    </p>
                  </div>
                  
                  {/* Section Compte et Profil */}
                  <div className="px-4 py-4 border-b border-neutral-100">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-semibold text-lg relative shadow-lg flex-shrink-0">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-light text-neutral-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Profil et Messages */}
                  <DropdownMenuItem asChild>
                    <Link href={user.role === "TENANT" ? "/tenant/profile" : "/landlord/profile"} className="flex items-center gap-4 w-full py-3 group/item">
                      <User className="h-5 w-5 text-neutral-400 group-hover/item:text-neutral-900 transition-colors duration-200 flex-shrink-0" strokeWidth={1.5} />
                      <span className="text-base font-light">{t("navbar.profile")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/tenant/messages" className="flex items-center gap-4 w-full relative py-3 group/item">
                      <MessageSquare className="h-5 w-5 text-neutral-400 group-hover/item:text-neutral-900 transition-colors duration-200 flex-shrink-0" strokeWidth={1.5} />
                      <span className="text-base font-light">{t("navbar.messages")}</span>
                      {notifications.messages > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px]">
                          {notifications.messages > 99 ? '99+' : notifications.messages}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* Section Navigation */}
                  {user.role === "LANDLORD" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/landlord/listings/new" className="flex items-center gap-4 w-full py-3 group/item">
                          <Plus className="h-5 w-5 text-neutral-400 group-hover/item:text-neutral-900 transition-colors duration-200" strokeWidth={1.5} />
                          <span className="text-base font-light">{t("navbar.createListing")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/landlord/applications" className="flex items-center gap-4 w-full relative py-3 group/item">
                          <FileText className="h-5 w-5 text-neutral-400 group-hover/item:text-neutral-900 transition-colors duration-200" strokeWidth={1.5} />
                          <span className="text-base font-light">{t("navbar.applications")}</span>
                          {notifications.applications > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px]">
                              {notifications.applications > 99 ? '99+' : notifications.applications}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/landlord/leases" className="flex items-center gap-4 w-full py-3 group/item">
                          <FileText className="h-5 w-5 text-neutral-400 group-hover/item:text-neutral-900 transition-colors duration-200" strokeWidth={1.5} />
                          <span className="text-base font-light">{t("navbar.contracts")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/landlord/rent-management" className="flex items-center gap-4 w-full py-3 group/item">
                          <DollarSign className="h-5 w-5 text-neutral-400 group-hover/item:text-neutral-900 transition-colors duration-200" strokeWidth={1.5} />
                          <span className="text-base font-light">{t("navbar.rentManagement")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/landlord/quick-actions" className="flex items-center gap-4 w-full py-3 group/item">
                          <Zap className="h-5 w-5 text-neutral-400 group-hover/item:text-neutral-900 transition-colors duration-200" strokeWidth={1.5} />
                          <span className="text-base font-light">Actions rapides</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/landlord/availability" className="flex items-center gap-4 w-full py-3 group/item">
                          <Calendar className="h-5 w-5 text-neutral-400 group-hover/item:text-neutral-900 transition-colors duration-200" strokeWidth={1.5} />
                          <span className="text-base font-light">Mes disponibilités</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/landlord/visits" className="flex items-center gap-4 w-full relative py-3 group/item">
                          <Calendar className="h-5 w-5 text-neutral-400 group-hover/item:text-neutral-900 transition-colors duration-200" strokeWidth={1.5} />
                          <span className="text-base font-light">{t("navbar.visitRequests")}</span>
                          {notifications.visitRequests > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px]">
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
                        <Link href="/tenant/favorites" className="flex items-center gap-4 w-full py-3 group/item">
                          <Heart className="h-5 w-5 text-neutral-400 group-hover/item:text-neutral-900 transition-colors duration-200" strokeWidth={1.5} />
                          <span className="text-base font-light">{t("navbar.favorites")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/tenant/applications" className="flex items-center gap-4 w-full relative py-3 group/item">
                          <FileText className="h-5 w-5 text-neutral-400 group-hover/item:text-neutral-900 transition-colors duration-200" strokeWidth={1.5} />
                          <span className="text-base font-light">{t("navbar.applications")}</span>
                          {notifications.applications > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px]">
                              {notifications.applications > 99 ? '99+' : notifications.applications}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/tenant/visits" className="flex items-center gap-4 w-full relative py-3 group/item">
                          <Calendar className="h-5 w-5 text-neutral-400 group-hover/item:text-neutral-900 transition-colors duration-200" strokeWidth={1.5} />
                          <span className="text-base font-light">{t("navbar.myVisits")}</span>
                          {notifications.visitRequests > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px]">
                              {notifications.visitRequests > 99 ? '99+' : notifications.visitRequests}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/tenant/payments" className="flex items-center gap-4 w-full py-3 group/item">
                          <CreditCard className="h-5 w-5 text-neutral-400 group-hover/item:text-neutral-900 transition-colors duration-200" strokeWidth={1.5} />
                          <span className="text-base font-light">{t("navbar.myPayments")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                        <Link href="/tenant/leases" className="flex items-center gap-4 w-full py-3 group/item">
                          <FileText className="h-5 w-5 text-neutral-400 group-hover/item:text-neutral-900 transition-colors duration-200" strokeWidth={1.5} />
                          <span className="text-base font-light">{t("navbar.leaseTracking")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                        <Link href="/tenant/rent-management" className="flex items-center gap-4 w-full py-3 group/item">
                          <DollarSign className="h-5 w-5 text-neutral-400 group-hover/item:text-neutral-900 transition-colors duration-200" strokeWidth={1.5} />
                          <span className="text-base font-light">{t("navbar.rentManagement")}</span>
                    </Link>
                  </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuSeparator />

                  {/* Section Paramètres */}
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-4 w-full py-3 group/item">
                      <Settings className="h-5 w-5 text-neutral-400 group-hover/item:text-neutral-900 transition-colors duration-200" strokeWidth={1.5} />
                      <span className="text-base font-light">{t("navbar.accountSettings")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/faq" className="flex items-center gap-4 w-full py-3 group/item">
                      <HelpCircle className="h-5 w-5 text-neutral-400 group-hover/item:text-neutral-900 transition-colors duration-200" strokeWidth={1.5} />
                      <span className="text-base font-light">{t("navbar.helpCenter")}</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Section Autres */}
                  <DropdownMenuItem asChild>
                    <Link href="/invite" className="flex items-center gap-4 w-full py-3 group/item">
                      <Gift className="h-5 w-5 text-neutral-400 group-hover/item:text-neutral-900 transition-colors duration-200" strokeWidth={1.5} />
                      <span className="text-base font-light">{t("navbar.inviteFriend")}</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Déconnexion */}
                  <DropdownMenuItem
                    onClick={signOut}
                    className="text-red-600 focus:text-red-700 focus:bg-red-50 py-3 group/item"
                  >
                    <LogOut className="h-5 w-5 mr-4 group-hover/item:text-red-700 transition-colors duration-200" strokeWidth={1.5} />
                    <span className="text-base font-light">{t("common.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <>
                {/* Sélecteur de langue pour utilisateurs non connectés */}
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-32 h-12 border-gray-200 bg-white/80 hover:bg-white hover:border-slate-400 hover:shadow-md transition-all duration-300 rounded-full px-4 font-light text-base text-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200 shadow-xl">
                    <SelectItem value="fr" className="cursor-pointer hover:bg-slate-50 rounded-lg text-base py-3">
                      Français
                    </SelectItem>
                    <SelectItem value="en" className="cursor-pointer hover:bg-slate-50 rounded-lg text-base py-3">
                      English
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Link href="/auth/signin">
                  <Button variant="ghost" size="lg" className="text-base font-light text-gray-700 hover:text-gray-900 py-6 px-6">
                    {t("common.login")}
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-slate-700 hover:bg-slate-800 text-white text-base font-light py-6 px-8">{t("common.signup")}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

