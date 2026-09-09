'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SecurityForm } from "./security-form"
import { ApiKeysForm } from "./api-keys-form"
import { SubscriptionSection } from "./subscription-section"
import { DangerZone } from "./danger-zone"
import { User } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

const sections = [
  { id: "security", title: "Sécurité", description: "Gérez vos identifiants et mot de passe", icon: "🔒" },
  { id: "subscription", title: "Abonnement", description: "Gérez votre forfait et vos accès", icon: "💳" },
  { id: "api-keys", title: "Clés API", description: "Configurez vos clés d'accès aux modèles d'IA", icon: "🔑" },
  { id: "danger-zone", title: "Zone de Danger", description: "Actions irréversibles et suppression de compte", icon: "⚠️" },
]

interface SettingsContentProps {
  user: User | null;
  isProPlan: boolean;
  subscriptionStatus: string;
}

export function SettingsContent({ user, isProPlan, subscriptionStatus }: SettingsContentProps) {
  const [activeSection, setActiveSection] = useState<string>("security")

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(section => ({
        id: section.id,
        element: document.getElementById(section.id),
      }))

      const currentSection = sectionElements.find(({ element }) => {
        if (!element) return false
        const rect = element.getBoundingClientRect()
        return rect.top <= 100 && rect.bottom > 100
      })

      if (currentSection) {
        setActiveSection(currentSection.id)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
  }

  return (
    <div className="flex gap-8 relative">
      {/* Table of Contents */}
      <div className="w-64 hidden lg:block">
        <div className="sticky top-20 rounded-lg border border-white/40 bg-white/80 backdrop-blur-xl p-4">
          <h3 className="font-semibold mb-4 text-muted-foreground text-xs uppercase tracking-wider">Sur cette page</h3>
          <div className="space-y-1">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left font-normal transition-all duration-200 relative pl-8",
                  activeSection === section.id && 
                  "bg-gradient-to-r from-purple-600/10 to-indigo-600/10 text-purple-600 font-medium",
                  activeSection !== section.id && "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => scrollToSection(section.id)}
              >
                <span className="absolute left-2">{section.icon}</span>
                <span className="truncate">{section.title}</span>
                {activeSection === section.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full" />
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-8">
        {/* Security Settings */}
        <Card id="security" className="border-white/40 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl">Sécurité</CardTitle>
            <CardDescription>Gérez votre adresse e-mail et votre mot de passe</CardDescription>
          </CardHeader>
          <CardContent>
            <SecurityForm user={user} />
          </CardContent>
        </Card>

        {/* Subscription Management */}
        <Card id="subscription" className="border-white/40 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl">Abonnement & Facturation</CardTitle>
            <CardDescription>Gérez votre formule, votre période active et votre statut</CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionSection />
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card id="api-keys" className="border-white/40 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl">Clés d&apos;accès API (Optionnel)</CardTitle>
            <CardDescription>Configurez vos propres clés d&apos;accès aux fournisseurs d&apos;IA</CardDescription>
          </CardHeader>
          <CardContent>
            <ApiKeysForm isProPlan={isProPlan} />
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card id="danger-zone" className="border-destructive/50 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl text-destructive">Zone de Danger</CardTitle>
            <CardDescription>Actions irréversibles et clôture de compte</CardDescription>
          </CardHeader>
          <CardContent>
            <DangerZone subscriptionStatus={subscriptionStatus} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 