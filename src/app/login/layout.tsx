import type {ReactNode} from "react";

const LoginLayout = ({children}: {children: ReactNode}) => {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-slate-900 relative overflow-hidden">
            {/* Background glowing orbs */}
            <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-sky-500/20 blur-[100px]"></div>
            <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-[100px]"></div>
            
            <div className="relative z-10 w-full max-w-md">
                {children}
            </div>
        </div>
    )
}

export default LoginLayout;