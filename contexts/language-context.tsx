"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Language = "en" | "ar"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [translations, setTranslations] = useState<Record<string, any>>({})

  useEffect(() => {
    // Load language from localStorage
    const savedLang = localStorage.getItem("language") as Language
    if (savedLang === "ar" || savedLang === "en") {
      setLanguageState(savedLang)
    }
  }, [])

  useEffect(() => {
    // Load translations
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/lang/${language}/${language}.json`)
        const data = await response.json()
        setTranslations(data)
      } catch (error) {
        console.error("Error loading translations:", error)
      }
    }
    loadTranslations()
  }, [language])

  useEffect(() => {
    // Update document direction
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = language
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) return key
    }
    return typeof value === "string" ? value : key
  }

  const isRTL = language === "ar"

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}

