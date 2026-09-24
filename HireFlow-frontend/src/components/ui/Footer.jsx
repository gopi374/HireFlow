import {
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";

const footerColumns = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Integrations", href: "#integrations" },
      { name: "Enterprise", href: "#enterprise" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "#about" },
      { name: "Customers", href: "#customers" },
      { name: "Careers", href: "#careers" },
      { name: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Blog", href: "#blog" },
      { name: "Help Center", href: "#help" },
      { name: "Documentation", href: "#documentation" },
      { name: "Privacy", href: "#privacy" },
    ],
  },
];

const socialLinks = [
  {
    label: "Twitter",
    href: "#",
    icon: FaTwitter,
  },
  {
    label: "Instagram",
    href: "#",
    icon: FaInstagram,
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: FaLinkedin,
  },
  {
    label: "GitHub",
    href: "#",
    icon: FaGithub,
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16">

        {/* Centered content */}
        <div className="flex flex-col items-center">

          {/* Logo */}
          <a
            href="#home"
            className="flex items-center gap-3"
          >
            <img
              src="/logo.png"
              alt="HireFlow"
              className="h-10 w-10 rounded-xl object-cover"
            />

            <span className="text-xl font-bold tracking-tight text-slate-900">
              HireFlow
            </span>
          </a>

          {/* Description */}
          <p className="mt-4 max-w-md text-center text-sm leading-6 text-slate-500">
            Connecting talented people with the right opportunities.
            Find great jobs, discover talented candidates, and build
            meaningful careers with HireFlow.
          </p>

          {/* Social icons */}
          <div className="mt-7 flex items-center gap-3">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-full
                  border border-slate-200
                  bg-slate-50
                  text-slate-500
                  transition-all duration-200
                  hover:-translate-y-1
                  hover:border-green-200
                  hover:bg-green-50
                  hover:text-green-600
                "
              >
                <Icon size={17} />
              </a>
            ))}
          </div>

          {/* Link columns */}
          <div className="mt-14 grid w-full grid-cols-1 gap-10 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div
                key={column.title}
                className="text-center sm:text-left"
              >
                <h3 className="
                  mb-5
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-slate-400
                ">
                  {column.title}
                </h3>

                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="
                          text-sm
                          text-slate-600
                          transition-colors
                          hover:text-green-600
                        "
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom section */}
          <div className="
            mt-14
            flex
            w-full
            flex-col
            items-center
            justify-between
            gap-4
            border-t
            border-slate-200
            pt-6
            text-sm
            text-slate-400
            md:flex-row
          ">
            <p>
              © 2026 HireFlow. All rights reserved.
            </p>

            <div className="flex items-center gap-5">
              <a
                href="#terms"
                className="transition-colors hover:text-slate-700"
              >
                Terms
              </a>

              <a
                href="#privacy"
                className="transition-colors hover:text-slate-700"
              >
                Privacy
              </a>

              <a
                href="#contact"
                className="transition-colors hover:text-slate-700"
              >
                Contact
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;