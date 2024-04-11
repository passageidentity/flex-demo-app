import { ReactElement, useState } from "react";
import { serverURL } from "../../utils/serverURL";
import { useNavigate } from "react-router-dom";
import { Input, Button, Card, CardHeader, CardBody, CardFooter } from "@nextui-org/react";
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
        }
    }

    const initialState = (
        <>
            <CardHeader className="justify-center"><h2>Register</h2></CardHeader>
            <CardBody className="gap-y-4">
                    <Input size="sm" label="Username" name="username" autoComplete="username webauthn" type="text" value={username} onValueChange={setUsername}/>
                    <Input size="sm" label="Password" name="password" value={password} onValueChange={setPassword}/>
            </CardBody>
            <CardFooter className="justify-center">
                <Button color="primary" size="lg" type="submit" onClick={register}>Register</Button>
            </CardFooter>
        </>
    );
    return (
        <Card className="min-w-80 max-w-2xl">
            {registerState === RegisterState.Initial && initialState}
            {registerState === RegisterState.AddPasskey && <AddPasskey/>}
        </Card>
    )
}