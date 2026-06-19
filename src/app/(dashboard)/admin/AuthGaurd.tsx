import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";

const AuthGuard = async ({children} : {children: React.ReactNode}) => {
    const supabase = await createClient();
    const {data: { user }, error} = await supabase.auth.getUser();
    
    if(!user || error){
        redirect("/login");
    }

    const {data: profile} = await supabase.from("profiles").select("role").eq("id", user.id).single();

    if (profile?.role !== "admin"){
        redirect("/");
    }

    return <>children</>;

}

export default AuthGuard;