import { UserButton } from "@clerk/nextjs";
import { Bell, Search } from "lucide-react";

export function AdminHeader() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1 max-w-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Rechercher..."
            className="w-full h-9 pl-9 pr-4 text-sm bg-muted rounded-lg border border-transparent focus:border-input focus:outline-none"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>
        <UserButton />
      </div>
    </header>
  );
}
