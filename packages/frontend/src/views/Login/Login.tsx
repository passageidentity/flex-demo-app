import { FormEvent, ReactElement, useEffect, useRef, useState } from "react";
import { serverURL } from "../../utils/serverURL";
import { PassageFlex } from "@passageidentity/passage-flex-js";
import { Link, useNavigate } from "react-router-dom";
import {
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@nextui-org/react";
import { AddPasskey } from "../../components/AddPasskey/AddPasskey";

const passage = new PassageFlex(import.meta.env.PASSAGE_APP_ID);

enum LoginState {
  Initial,
  Password,
  Passkey,
  AddPasskey,
}

interface ILoginProps {
  onLogin: () => Promise<void>;
}

export function Login(props: ILoginProps): ReactElement {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [canAuthenticateWithPasskey, setCanAuthenticateWithPasskey] =
    useState<boolean>(false);
  const navigate = useNavigate();
  const transactionID = useRef<string>("");
  const skippedPasskey = useRef<boolean>(false);
  const [error, setError] = useState<string>("");

  const [loginState, setLoginState] = useState<LoginState>(LoginState.Initial);

  const isDisablePasskeyPrompt =
    import.meta.env.PASSAGE_DISABLE_PASSKEY_PROMPT_AFTER_REGISTER === "true";

  const showLoginWithPassageButton =
    import.meta.env.PASSAGE_LOGIN_WITH_PASSKEY_BUTTON === "true";

  const isDisableAutoLogin =
    import.meta.env.PASSAGE_DISABLE_AUTO_LOGIN === "true";

  const enterPassword = (password: string) => {
    setError("");
    setPassword(password);
  };

  const enterUsername = (username: string) => {
    setError("");
    setUsername(username);
  };

  const getTransaction = async () => {
    const res = await fetch(`${serverURL}/auth/passkey/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username }),
    });
    if (res.ok) {
      transactionID.current = (await res.json()).transactionId;
    } else {
      if (res.status === 404) {
        throw new Error("User does not exist");
      }
      transactionID.current = "";
    }
  };

  const verifyNonce = async (nonce: string) => {
    const res = await fetch(`${serverURL}/auth/passkey/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ nonce: nonce }),
    });
    if (res.ok) {
      await props.onLogin();
      navigate("/profile");
    }
  };
  const loginWithPassword = async (event: FormEvent) => {
    event.preventDefault();
    const res = await fetch(`${serverURL}/auth/password/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username: username, password: password }),
    });
    if (res.ok) {
      if (
        !skippedPasskey.current &&
        !isDisablePasskeyPrompt &&
        (await passage.passkey.canAuthenticateWithPasskey())
      ) {
        setLoginState(LoginState.AddPasskey);
        return;
      }
      await props.onLogin();
      navigate("/profile");
    } else {
      setError("Invalid password");
    }
  };
  const loginWithPasskey = async () => {
    setError("");
    try {
      if (transactionID.current === "") {
        await getTransaction();
      }
      //@ts-ignore
      const nonce = await passage.passkey.authenticate({
        transactionId: transactionID.current,
      });
      await verifyNonce(nonce);
    } catch {
      setError("Failed to login with passkey");
      transactionID.current = "";
    }
  };

  const loginWithDiscoverable = async () => {
    passage.passkey.authenticate().then((nonce) => {
      verifyNonce(nonce);
    });
  };

  const checkPasskey = async () => {
    if (!(await passage.passkey.canAuthenticateWithPasskey())) {
      setLoginState(LoginState.Password);
      return;
    }
    try {
      await getTransaction();
    } catch {
      setError("User does not exist");
      return;
    }
    if (transactionID.current !== "") {
      setLoginState(LoginState.Passkey);
    } else {
      setLoginState(LoginState.Password);
    }
  };

  const usePassword = () => {
    skippedPasskey.current = true;
    setLoginState(LoginState.Password);
  };

  useEffect(() => {
    if (!isDisableAutoLogin) {
      passage.passkey
        .authenticate({ isConditionalMediation: true })
        .then((nonce) => {
          verifyNonce(nonce);
        });
    }
  }, []);

  useEffect(() => {
    const updateCanAuthenticateWithPasskey = async () => {
      const canAuthenticate =
        await passage.passkey.canAuthenticateWithPasskey();
      setCanAuthenticateWithPasskey(canAuthenticate);
    };
    updateCanAuthenticateWithPasskey();
  }, []);

  const initialState = (
    <>
      <CardHeader className="justify-center">
        <h2>Login</h2>
      </CardHeader>
      <CardBody className="gap-y-4">
        <Input
          size="sm"
          label="Username"
          name="username"
          autoComplete="username webauthn"
          type="text"
          value={username}
          onValueChange={enterUsername}
          isInvalid={!!error}
          errorMessage={error}
        />
      </CardBody>
      <CardFooter className="justify-center flex-col">
        <div>
          <Button
            color="primary"
            size="lg"
            type="submit"
            onClick={checkPasskey}
          >
            Continue
          </Button>
          {showLoginWithPassageButton && canAuthenticateWithPasskey && (
            <Button
              className="ml-2"
              color="primary"
              size="lg"
              type="submit"
              onClick={loginWithDiscoverable}
            >
              Login With Passkey
            </Button>
          )}
        </div>
        <div className="mt-8">
          Don't have an account?{" "}
          <Link className="font-bold" to="/register">
            <u>Register here.</u>
          </Link>
        </div>
      </CardFooter>
    </>
  );

  const passkeyState = (
    <>
      <CardHeader className="justify-center">
        <h2>Login with Passkey</h2>
      </CardHeader>
      <CardBody>
        <p className="max-w-72">
          Passkeys are a simple and more secure alternative to passwords.
          <br />
          <br />
          Log in with the method you already use to unlock your device.{" "}
          <a
            href="https://blog.1password.com/what-is-webauthn/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <u>Learn more →</u>
          </a>
        </p>
        {!!error && <p className="text-danger mt-4">{error}</p>}
      </CardBody>
      <CardFooter className="justify-center gap-x-4 mt-4">
        <Button
          color="primary"
          size="lg"
          type="submit"
          onClick={loginWithPasskey}
        >
          {error ? "Try again" : "Login"}
        </Button>
        <Button variant="bordered" size="lg" onClick={usePassword}>
          Use Password
        </Button>
      </CardFooter>
    </>
  );

  const passwordState = (
    <>
      <CardHeader className="justify-center">
        <h2>Login with Password</h2>
      </CardHeader>
      <CardBody className="gap-y-4">
        <Input
          size="sm"
          label="Password"
          name="password"
          type="password"
          value={password}
          onValueChange={enterPassword}
          isInvalid={!!error}
          errorMessage={error}
        />
      </CardBody>
      <CardFooter className="justify-center mt-4">
        <Button
          color="primary"
          size="lg"
          type="submit"
          onClick={loginWithPassword}
        >
          Login
        </Button>
      </CardFooter>
    </>
  );

  return (
    <Card className="sm:min-w-80 p-4 mx-4">
      {loginState === LoginState.Initial && initialState}
      {loginState === LoginState.Passkey && passkeyState}
      {loginState === LoginState.Password && passwordState}
      {loginState === LoginState.AddPasskey && <AddPasskey />}
    </Card>
  );
}
