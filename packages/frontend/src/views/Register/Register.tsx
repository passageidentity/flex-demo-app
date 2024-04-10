import { FormEvent, ReactElement, useRef } from "react";
import { serverURL } from "../../utils/serverURL";
import { useNavigate } from "react-router-dom";

export function Register(): ReactElement {
    const username = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const register = async (event: FormEvent) => {
        event.preventDefault();
        const res = await fetch(`${serverURL}/auth/password/login`, { 
            method: 'POST', 
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify({username: username.current?.value, password: password.current?.value})
        });
        if(res.ok){
            navigate('/dashboard');
        }
    }
    return (
        <form method="post" onSubmit={register} style={{display: 'flex', flexDirection: 'column'}}>
            <label>Username: <input name="username" placeholder="username" type="text" ref={username}/></label>
            <label>Password: <input name="username" placeholder="username" type="password" ref={password}/></label>
            <button type="submit">Register</button>
        </form>
    )
}