
import * as React from "react";
import { cn } from "@/lib/utils";


// Note: installing class-variance-authority is good practice for variants, but to avoid extra deps for now 
// I will implement a simpler version or just install it. 
// Actually, standard Shadcn uses it. I'll just use simple string interpolation or conditional classes for now 
// to keep dependencies minimal unless requested, but CVA is great.
// Let's stick to standard prop approach without CVA for this simple app to avoid another install if possible,
// OR just install it. It's cleaner. 
// I'll install class-variance-authority.

// But wait, I need to install it first.
// I'll skip CVA for now and use simple switch/cn.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "md", ...props }, ref) => {
        const variants = {
            default: "bg-primary text-primary-foreground hover:opacity-90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            ghost: "hover:bg-muted hover:text-foreground",
            danger: "bg-red-500 text-white hover:bg-red-600",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 py-2",
            lg: "h-12 px-8 text-lg",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
