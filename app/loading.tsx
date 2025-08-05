import Image from "next/image";

export default function Loading() {
  return (
    <div className="bg-slate-900 text-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="heading-xl text-yellow-400 font-retro mb-4 flex items-center justify-center gap-3">
            SITEGRADE
            <Image
              src="/SITEGRADE-logo.svg"
              alt="SiteGrade Logo"
              width={48}
              height={48}
              className="inline-block"
            />
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-yellow-400 animate-pulse"></div>
            <div
              className="w-3 h-3 bg-yellow-400 animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-3 h-3 bg-yellow-400 animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
        <p className="text-slate-300">Generating your report...</p>
      </div>
    </div>
  );
}
