import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">VCL</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Your source for MCLA lacrosse news, rankings, and transfers.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Content</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/articles" className="hover:text-foreground">
                  Articles
                </Link>
              </li>
              <li>
                <Link href="/polls" className="hover:text-foreground">
                  Media Poll
                </Link>
              </li>
              <li>
                <Link href="/transfers" className="hover:text-foreground">
                  Transfers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">About</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About VCL
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Follow</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} VCL. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
