export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border/20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              The Curated Rank
            </h3>
            <p className="text-foreground/70">Discover expertly curated content across all your favorite categories.</p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">
                  Movies
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">
                  TV Shows
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">
                  Music
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-4">Tools</h4>
            <ul className="space-y-2">
              <li>
                <a href="/admin" className="text-foreground/70 hover:text-primary transition-colors">
                  Admin Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/20 pt-8 text-center text-foreground/50">
          <p>&copy; 2025 The Curated Rank. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
