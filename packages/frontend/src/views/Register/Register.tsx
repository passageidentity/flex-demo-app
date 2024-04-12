import { ReactElement, useState } from "react";
import { serverURL } from "../../utils/serverURL";
import { useNavigate } from "react-router-dom";
import { Input, Button, Card, CardHeader, CardBody, CardFooter, user } from "@nextui-org/react";
import { PassageFlex } from "@passageidentity/passage-flex-js";
import { AddPasskey } from "../../components/AddPasskey/AddPasskey";

const passage = new PassageFlex(import.meta.env.PASSAGE_APP_ID);

enum RegisterState {
    Initial,
    AddPasskey
}

export function Register(): ReactElement {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const navigate = useNavigate();
    const [error, setError] = useState<string>('');

    const enterUsername = (username: string) =>{ 
        setError('');
        setUsername(username);
    }

    const [registerState, setRegisterState] = useState<RegisterState>(RegisterState.Initial);

    const register = async () => {
        const res = await fetch(`${serverURL}/auth/password/register`, { 
            method: 'POST', 
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify({username: username, password: password})
        });
        if(res.ok){
            if(await passage.passkey.canRegisterPasskey()){
                setRegisterState(RegisterState.AddPasskey);
                return;
            }
            navigate('/dashboard');
        } else {
            setError('User already exists');
        }
    }

    const initialState = (
        <>
            <CardHeader className="justify-center"><h2>Register</h2></CardHeader>
            <CardBody className="gap-y-4">
                    <Input size="sm" label="Username" name="username" autoComplete="username webauthn" type="text" value={username} onValueChange={enterUsername} isInvalid={!!error}/>
                    <Input size="sm" label="Password" name="password" type="password" value={password} onValueChange={setPassword} errorMessage={error}/>
            </CardBody>
            <CardFooter className="justify-center flex-col">
                <Button color="primary" size="lg" onClick={register}>Register</Button>
                <div className="mt-4">Already have an account? <a className="font-bold"href="/login"><u>Login here.</u></a></div>
            </CardFooter>
        </>
    );
    return (
        <Card className="min-w-80">
            {registerState === RegisterState.Initial && initialState}
            {registerState === RegisterState.AddPasskey && <AddPasskey/>}
        </Card>
    )
}