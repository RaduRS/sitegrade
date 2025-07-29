interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="w-full py-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 font-retro">
          {title}
        </h1>
      </div>
    </header>
  );
}