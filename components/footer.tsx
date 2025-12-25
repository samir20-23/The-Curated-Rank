"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function Footer() {
  const { t, language } = useLanguage()
  const [links, setLinks] = useState<any>(null)

  useEffect(() => {
    fetch("/links.json")
      .then((res) => res.json())
      .then((data) => setLinks(data))
      .catch((err) => console.error("Error loading links:", err))
  }, [])

  return (
    <footer className="relative mt-24 border-t border-border/20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
              Marwanscope
            </h3>
            <p className="text-foreground/70 text-sm">
              {language === "ar" 
                ? "اكتشف المحتوى المختار بعناية عبر جميع فئاتك المفضلة."
                : "Discover expertly curated content across all your favorite categories."}
            </p>
          </div>

          {links && (
            <>
              <div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="genres" className="border-none">
                    <AccordionTrigger className="text-sm font-bold text-foreground py-2 hover:no-underline">
                      {language === "ar" ? "الأنواع" : "Genres"}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-sm">
                        {Object.entries(links.genres || {}).map(([key, url]: [string, any]) => (
                          <li key={key}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-foreground/70 hover:text-primary transition-colors"
                            >
                              {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="decades" className="border-none">
                    <AccordionTrigger className="text-sm font-bold text-foreground py-2 hover:no-underline">
                      {language === "ar" ? "العقود" : "Decades"}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-sm">
                        {Object.entries(links.by_decades || {}).map(([key, url]: [string, any]) => (
                          <li key={key}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-foreground/70 hover:text-primary transition-colors"
                            >
                              {key}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="world" className="border-none">
                    <AccordionTrigger className="text-sm font-bold text-foreground py-2 hover:no-underline">
                      {language === "ar" ? "سينما العالم" : "World Cinema"}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-sm">
                        {Object.entries(links.world_cinema || {}).map(([key, url]: [string, any]) => (
                          <li key={key}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-foreground/70 hover:text-primary transition-colors"
                            >
                              {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </>
          )}
        </div>

        {/* Social Media Links */}
        {links && links.external && (
          <div className="border-t border-border/20 pt-4 ">
            <h4 className="text-sm font-bold text-foreground mb-4 text-center">
              {language === "ar" ? "حسابات التواصل الاجتماعي" : "Social Media"}
            </h4>
            <div className="flex flex-wrap justify-center gap-4">
              {Object.entries(links.external).map(([key, url]: [string, any]) => {
                if (key === "1000_films_before_you_die" || key === "ultimate_top_10_lists") return null
                const iconMap: Record<string, string> = {
                  facebook: "📘",
                  twitter_x: "𝕏",
                  instagram: "📷",
                  youtube: "▶️",
                  tiktok: "🎵",
                  twitch: "🎮",
                  kick: "👊",
                  imdb: "🎬",
                  serializd: "📺",
                  spotify_playlist: "🎵",
                }
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 glass rounded-lg text-foreground hover:bg-secondary/30 transition-colors text-sm"
                    title={key.replace(/_/g, " ")}
                  >
                    {iconMap[key] || "🔗"} {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </a>
                )
              })}
            </div>
          </div>
        )}

        <div className="border-t border-border/20 pt-6 text-center text-foreground/50 text-sm">
          <p>&copy; 2025 Marwanscope. {language === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
        </div>
      </div>
    </footer>
  )
}
