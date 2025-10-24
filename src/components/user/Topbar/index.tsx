export default function Topbar() {
    return (
        <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-full items-center justify-between px-4">
                <div className="text-sm text-muted-foreground">User Console</div>
                <div className="flex items-center gap-2">
                    {/* Add user avatar, quick actions, theme toggle, etc. */}
                </div>
            </div>
        </div>
    );
}