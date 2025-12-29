"use client"
import '../styles/lloader.css';
import { useLanguage } from "@/contexts/language-context"
import { useState, useEffect } from "react"

export default function Hero() {
  const { t } = useLanguage()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative py-12 md:py-20 overflow-hidden from-gray-900 to-gray-800">

      {showContent && (
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <div className="lloader-wrapper">
                <span className="lloader-letter">{t("hero.d") || " "}</span>
                <span className="lloader-letter">{t("hero.i") || " "}</span>
                <span className="lloader-letter">{t("hero.s") || " "}</span>
                <span className="lloader-letter">{t("hero.c") || " "}</span>
                <span className="lloader-letter">{t("hero.o1") || " "}</span>

                <span className="lloader-letter"></span>

                <span className="lloader-letter">{t("hero.amp") || " "}</span>

                <span className="lloader-letter"></span>

                <span className="lloader-letter">{t("hero.E") || " "}</span>
                <span className="lloader-letter">{t("hero.x") || " "}</span>
                <span className="lloader-letter">{t("hero.p") || " "}</span>
                <span className="lloader-letter">{t("hero.l") || " "}</span>
                <span className="lloader-letter">{t("hero.o2") || " "}</span>
                <span className="lloader-letter">{t("hero.r") || " "}</span>

                <div className="lloader"></div>
              </div>
            </h1>
            <p className="text-white/70 mb-6 text-lg md:text-xl">
              <span className="font-semibold"> {t("hero.welcome")} </span>
            </p>
            <p className="text-white/50 text-sm md:text-base">
              {t("hero.scroll")}
            </p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 from-gray-900 to-transparent pointer-events-none" />
    </section>
  )
}
