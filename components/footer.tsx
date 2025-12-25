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
              MarwanRank
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
                  facebook: "https://www.iconpacks.net/icons/2/free-icon-facebook-logo-2428.png",
                  twitter_x: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYmWddKiztYRipC1iq_-R3EIwyKIwUHc4snQ&s",
                  instagram: "https://www.iconpacks.net/icons/3/free-icon-instagram-logo-8869.png",
                  youtube: "https://www.iconpacks.net/icons/2/free-icon-youtube-logo-2431.png",
                  tiktok: "https://www.iconpacks.net/icons/2/free-icon-tiktok-logo-4500.png",
                  twitch: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAulBMVEWpQ/8AAAD///+sRv9dLompSvWJiYmRkZGiSvAPBSBGRkb7+/usQ//Nzc2oRP85OTloaGgzMzONQsp7PLXBwcETExOqqqoBAAMMDAz09PSqS/uuRf9eLo0tFkYAABOjS+svFUCjTegzGlBNTU0kJCQ1Hk87H1Q6HVheXl4rKyu4uLitra0KAhspEEMiDjOhTOEcECmYTNVzc3MHBhGJRsOCQbN4P6pmOYxNKG2MRMdQK3NVLHxXLYKeQOeH4RkFAAAED0lEQVR4nO2cYVfTMBSGW+tksBiEoYUNmCKiAooITAb6//+WSbvSNe1auiYnd5f3YZ/asrNn781t2p00CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcIhUf7bfkRJSKCLLjCPh2ytHiP7ha+sc9nx75Yj+UWif475vryfE5GMY2zfcpGIoxeTIhSAZw0h8ciNIxVC6GYOEDHWJsjYUkxM3JUrEcF6ijhT9GwppnCY+v7HBxikZQ5XgSeFL33hlhS0yhqL/JWRtWG4ynAylLlEjQV6G5THIzbAqQV6GWrB8FmRkKPpnSrCkyMVQyGByVi5RPoaysslwMgyCfnWCbAyrmwwnw9HXMLmaqLBkYthbUqIv23CQ8azta2g42H+fEL4zdmynO/Z31t4wO6BkON8OQxjCEIYwhCEMYQhDGMIQhjCEIQxhCEMYwhCGL83wm7Hj+3z76dobfphzbuy4mG+/WHfDlsAQhjCEIQw7sxcyN3wS5GqYCzI1XBAMLzka5oJxGP7wtHbNpeFCgnH488rT+kOHhoslqgR9LSN1Z2gICl9LSJ0ZFgR/qRIdMzMsCG5eiciTnzPDQpO5vBaRv7XcbgyLCV57TNCRYUFQJ+hzoboLw1KC3DI0xuDY8+MU7BuaTcavnwNDYwyOfRZok+Hvt2UOijoHpQPOi4Ji5FuwzrCKvaLgdu3ByWnC+0NNuhg2CB77PQ9mdDAc7NQeeqOajPcAgy6GDQle7goKfh0MmwRplGiwuuGgXjD2PFVbYEXDg5oxGOsmQyTAYFXDhhK9mRHJT7OSYUOJKkE6Ea5kWFeimhmZMahZwbChRMNdX3dkqmlvWCeol2reEqpQTWvDhplMOKOVYHvDJsFbaoJtDc+36vdngjQmbAktDetQg3AWebu1vRRrhnoxuGoy5ARtZhgOx0LYfy5oVywa3ukxSM3PpuFdJIU2pFandgzjRNC3SzU2DHWT0QlSSy/FUpVOoyAid65PsWM4pVqiwQqGVY96mUbqckkSlWxlWP2UF12ihIlmu8v4U6l4b/7D7IriTCZHLGU8rIrxfmQel7yJb41aln08UTLUCfaELNYkwbm2gdSfOJlNJi+ZvUTZMElQ9xORH5y+BcHJ2jMoGiYdRiVIPbA2GIZK8aEnSPeUthhVGocPI1J3CbtjjkOVoAyI/J5khwVDPQh1gvo5oL4/lkWKGSYJMiM3VBE+9ij9FGGJxQwfRwwFFw11gjR+lLeKNoyzBCXFe0xdSQ3jTJAhSZXOBTmdI3LmVZo2GZYhpp3mb5IgT8FomDaZgGmCan421IJkbzBZYDxUJaou4dkaCjF9GPG6ljAQwT+Gk20TnqdBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADo8x8MZn+0pNMUcgAAAABJRU5ErkJggg==",
                  kick: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlNyIfloQPTGE4GpqKvNVgJiTF0jVeO0B-Og&s",
                  imdb: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrs4DH8_DmE1D2Z32LrprW8JheY2CFHH48aw&s",
                  serializd: "https://img.utdstc.com/icon/051/397/051397a508a31fca2b4aa93893591e9865987069a2ebdd6162cec00d46a18f04:200",
                  spotify_playlist: "https://s3-alpha.figma.com/hub/file/2734964093/9f5edc36-eb4d-414a-8447-10514f2bc224-cover.png"
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
                    <img src={iconMap[key]} alt="" className="  glass-strong    cursor-pointer opacity-96 hover:opacity-100   animate-pulse   duration-500 ease-in-out transition-all duration-100 ease-in-out  hover:scale-120 transition-transform"
                      style={{
                        borderRadius: "300px",
                        maxWidth: "30px"

                      }} />
                  </a>
                )
              })}
            </div>
          </div>
        )}

        <div className="border-t border-border/20 pt-6 text-center text-foreground/50 text-sm">
          <p>&copy; 2025 MarwanRank. {language === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
        </div>
      </div>
    </footer>
  )
}
