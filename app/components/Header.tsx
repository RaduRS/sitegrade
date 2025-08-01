import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="w-full py-8" role="banner">
      <div className="text-center">
        <Link href="/" className="inline-block">
          <h1 
            className="text-3xl md:text-4xl font-bold text-yellow-400 font-retro flex items-center justify-center gap-3 hover:text-yellow-300 transition-colors cursor-pointer"
            aria-label={`${title} - Professional website reviews`}
          >
            {title}
            <Image
              src="/SITEGRADE-logo.svg"
              alt="SiteGrade Logo"
              width={40}
              height={40}
              className="inline-block"
            />
          </h1>
        </Link>
      </div>
    </header>
  );
}