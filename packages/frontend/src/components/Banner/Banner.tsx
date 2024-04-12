import { Button } from "@nextui-org/react"
import { useEffect, useState } from "react";
import { serverURL } from "../../utils/serverURL";
import { useNavigate, Link } from "react-router-dom";

interface IBannerProps {
    refresh: number;
}

export function Banner(props: IBannerProps){
    const navigate = useNavigate();
    const [authenticated, setAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const checkUser = async () =>{
        fetch(`${serverURL}/auth/user`).then(async (response) => {
            if (response.ok) {
                setAuthenticated(true);
            } else {
                setAuthenticated(false);
            }
        }).catch(() => {
            setAuthenticated(false);
        }).finally(()=>{
            setLoading(false);
        });
    }

    useEffect(()=>{
        checkUser();
    }, [props.refresh]);

    const logout = async () =>{
        await fetch(`${serverURL}/auth/user/logout`, { 
            method: 'POST', 
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include',
        });
        await checkUser();
        navigate('/login');
    }

    const Authenticated = (
        <>
            <Button variant="bordered" size="sm" radius="md" onClick={logout}>Logout</Button>
            <Link to="/profile"><img src="/profile.svg" alt="Profile" className="min-w-8 min-w-8" onClick={()=>navigate('/profile')}/></Link>
        </>
    );

    const Unauthenticated = (
        <>
            <Link to="/login"><Button color="primary" size="sm" radius="md">Login</Button></Link>
            <Link to="/register"><Button variant="bordered" size="sm" radius="md">Register</Button></Link>
        </>
    );
    
    return (
        <div className="w-full bg-slate-100 py-4 px-12 flex justify-between sm:grid gap-4 sm:grid-cols-4">
            <div className="hidden sm:flex gap-x-4 items-center">
                <Link to="/">Buy</Link>
                <Link to="/">Sell</Link>
                <Link to="/">Rent</Link>
            </div>
            <div className="flex justify-center items-center col-span-2">
                <Link to="/"><img src="/home-search.svg" alt="Home Search Logo" className="w-64 min-w-32"/></Link>
            </div>
            <div className="flex gap-x-4 justify-end items-center">
                {!loading && (authenticated ? Authenticated : Unauthenticated)}
            </div>
        </div>
    )
}