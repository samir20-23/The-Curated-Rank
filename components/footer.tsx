"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useFirebaseSocialLinks } from "@/hooks/use-firebase-social-links"
import SocialLinkDialog from "@/components/admin/social-link-dialog"
import OptimizedImage from "@/components/optimized-image"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { SocialLink } from "@/lib/types"

export default function Footer() {
  const { t, language } = useLanguage()
  const { isAdmin } = useAuth()
  const { links: socialLinks, deleteLink } = useFirebaseSocialLinks()
  const [links, setLinks] = useState<any>(null)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null)

  useEffect(() => {
    fetch("/links.json")
      .then((res) => res.json())
      .then((data) => setLinks(data))
      .catch((err) => console.error("Error loading links:", err))
  }, [])

  const handleAddLink = () => {
    setEditingLink(null)
    setIsLinkDialogOpen(true)
  }

  const handleEditLink = (link: SocialLink) => {
    setEditingLink(link)
    setIsLinkDialogOpen(true)
  }

  const handleDeleteLink = async (id: string) => {
    if (confirm("Are you sure you want to delete this link?")) {
      await deleteLink(id)
    }
  }

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
        <div className="border-t border-border/20 pt-4 ">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h4 className="text-sm font-bold text-foreground">
              {language === "ar" ? "حسابات التواصل الاجتماعي" : "Social Media"}
            </h4>
            {isAdmin && (
              <button
                onClick={handleAddLink}
                className="px-2 py-1 glass text-primary hover:bg-primary/20 rounded text-xs font-medium transition"
                title="Add Social Link"
              >
                +
              </button>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {/* Firebase Social Links */}
            {socialLinks.map((link) => (
              <div key={link.id} className="relative group" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 glass rounded-lg text-foreground hover:bg-secondary/30 transition-colors text-sm"
                  title={link.name}
                >


                  {link.iconUrl ? (
                    <OptimizedImage
                      src={link.iconUrl}
                      alt={link.name}
                      width={30}
                      height={30}
                      className="glass-strong cursor-pointer opacity-96 hover:opacity-100 hover:animate-pulse duration-500 ease-in-out transition-all duration-100 ease-in-out hover:scale-120 transition-transform"
                      style={{
                        borderRadius: "300px",
                        maxWidth: "30px",
                      }}
                      sizes="30px"
                    />
                  ) : (
                    <span className="text-xs">{link.name}</span>
                  )}
                </a>
                {isAdmin && (
                  <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditLink(link)
                      }}
                      className="group relative flex h-4 w-4 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-red-500/90 backdrop-blur-md shadow-md transition-all duration-300  active:translate-x-px active:translate-y-px"
                    >
                      <svg viewBox="0 0 1024 1024" className="h-3.5 w-3.5 fill-white">
                        <path d="M603.733333 181.333333L386.133333 401.066667c-6.4 6.4-10.666667 14.933333-12.8 25.6l-51.2 211.2c-8.533333 38.4 23.466667 74.666667 61.866667 64l200.533333-53.333334c8.533333-2.133333 17.066667-6.4 23.466667-14.933333l234.666667-236.8V853.333333c0 40.533333-32 72.533333-70.4 74.666667H170.666667c-40.533333 0-74.666667-34.133333-74.666667-74.666667V256c0-40.533333 34.133333-74.666667 74.666667-74.666667h433.066666z" />
                        <path d="M738.133333 147.2L435.2 448c-4.266667 4.266667-6.4 8.533333-8.533333 14.933333l-32 125.866667c-6.4 23.466667 14.933333 44.8 38.4 38.4l128-29.866667c6.4-2.133333 10.666667-4.266667 14.933333-8.533333l300.8-302.933333c38.4-38.4 38.4-102.4 0-140.8s-100.266667-38.4-138.666667 2.133333z" />
                      </svg>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteLink(link.id)
                      }}
                      className="group relative flex h-4 w-4 cursor-pointer items-center justify-center overflow-hidden rounded-full glass text-red-400 transition-all duration-300  active:translate-x-px active:translate-y-px"
                    >
                      <svg viewBox="0 0 118 118" className="h-3.5 w-3.5" fill="none">
                        <path d="M95.875 27.0416L92.8281 76.3317C92.0493 88.9248 91.6604 95.2215 88.5039 99.7488C86.9429 101.987 84.9339 103.876 82.6034 105.295C77.8903 108.167 71.5817 108.167 58.9641 108.167C46.3303 108.167 40.0133 108.167 35.297 105.29C32.9653 103.868 30.9553 101.976 29.3952 99.7336C26.2397 95.1994 25.859 88.8938 25.0977 76.283L22.125 27.0416" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
                        <path d="M14.75 27.0417H103.25M78.9405 27.0417L75.5844 20.1177C73.3547 15.5183 72.2396 13.2186 70.3167 11.7844C69.8904 11.4662 69.4386 11.1832 68.9661 10.9381C66.8367 9.83337 64.281 9.83337 59.1696 9.83337C53.9299 9.83337 51.3103 9.83337 49.1454 10.9845C48.6657 11.2396 48.2078 11.534 47.7767 11.8648C45.8314 13.3571 44.7448 15.741 42.5715 20.5087L39.5935 27.0417" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
                        <path d="M46.7083 81.125V51.625" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
                        <path d="M71.2917 81.125V51.625" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
                      </svg>
                    </button>

                  </div>
                )}
              </div>
            ))}
            {/* Legacy links.json links (if no Firebase links or as fallback) */}
            {socialLinks.length === 0 && links && links.external && (
              <>
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
                      <OptimizedImage
                        src={iconMap[key]}
                        alt=""
                        width={30}
                        height={30}
                        className="glass-strong cursor-pointer opacity-96 hover:opacity-100 animate-pulse duration-500 ease-in-out transition-all duration-100 ease-in-out hover:scale-120 transition-transform"
                        style={{
                          borderRadius: "300px",
                          maxWidth: "30px"
                        }}
                        sizes="30px"
                      />
                    </a>
                  )
                })}
              </>
            )}
          </div>
        </div>

        {isAdmin && (
          <SocialLinkDialog
            isOpen={isLinkDialogOpen}
            onClose={() => {
              setIsLinkDialogOpen(false)
              setEditingLink(null)
            }}
            editingLink={editingLink}
          />
        )}

        <div className="border-t border-border/20 pt-6 text-center text-foreground/50 text-sm">
          <p>&copy; 2025 MarwanRank. {language === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
        </div>
      </div>
    </footer>
  )
}
