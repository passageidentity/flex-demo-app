import { ReactElement, useState } from "react";
import { serverURL } from "../../utils/serverURL";
import { useNavigate } from "react-router-dom";
import { Input, Button, CardHeader, CardBody, CardFooter } from "@nextui-org/react";
import { PassageFlex } from "@passageidentity/passage-flex-js";

const passage = new PassageFlex(import.meta.env.PASSAGE_APP_ID);

export function AddPasskey(): ReactElement {
    const navigate = useNavigate();
    const [error, setError] = useState<string>('');

    const addPasskey = async () => {
        const res = await fetch(`${serverURL}/auth/passkey/add`, {
            method: 'POST',
        });
        const resBody = await res.json();
        const transactionID = resBody.transaction_id;
        try {
            await passage.passkey.register(transactionID);
            navigate('/dashboard');
        } catch {
            setError('Failed to add passkey');
        }
    }

    const skip = () =>{
        navigate('/dashboard');
    }

    return (
        <>
            <CardHeader className="justify-center"><h2>Add Passkey</h2></CardHeader>
                <CardBody className="gap-y-4">
                    <p className="max-w-72">
                        Passkeys are a simple and more secure alternative to
                        passwords.
                        <br />
                        <br />
                        Log in faster with the method you already use to unlock your device. <a href="https://blog.1password.com/what-is-webauthn/" target="_blank" rel="noopener noreferrer"><u>Learn more →</u></a>
                    </p>
                </CardBody>
                <CardFooter className="justify-center gap-x-4">
                    <Button color="primary" size="lg"  onClick={addPasskey}>Add Passkey</Button>
                    <Button variant="bordered" size="lg" onClick={skip}>Skip</Button>
            </CardFooter>
        </>
    )
}