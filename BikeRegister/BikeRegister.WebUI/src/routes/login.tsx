import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { postApiVbyVersionAuthLoginMutation, getApiVbyVersionUserGetAuthenticatedOptions } from '../hey-api/@tanstack/react-query.gen';
import {
  Button,
  Input,
  Label,
  Toast,
  ToastTitle,
  ToastBody,
  Toaster,
  useId,
  useToastController,
  ToastTrigger,
  Link
} from "@fluentui/react-components";
import { createFileRoute, Link as RouterLink, useNavigate } from '@tanstack/react-router';
import type { AuthResult, UserResult } from '../types';
import { useAuthStore } from '../state/authStore';
import { createClient } from '../hey-api/client';
import { getFullLocale } from '../services/localeService';

export const Route = createFileRoute('/login')({
  component: LoginComponent,
})

function LoginComponent() {
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);
  const login = useAuthStore((state) => state.login);
  const setUser = useAuthStore((state) => state.setUser);
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate({ from: "/login" });
  const [useEmail, setUseEmail] = useState(true)

  const localClient = createClient({
    baseUrl: 'https://localhost:26786/',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Accept-Language': getFullLocale(),
    },
  });

  const form = useForm({
      defaultValues: {
        email: "",
        userName: "",
        password: "",
      },
      onSubmit: async ({ value }) => {
        await loginMutation.mutateAsync({
            body: value,
            path: { version: '1', }
        });
      },
  });

  const { data, error } = useQuery({
    ...getApiVbyVersionUserGetAuthenticatedOptions({
      client: localClient,
      path: { version: '1' }
    }),
    enabled: accessToken !== null,
  })

  useEffect(() => {
    if (!accessToken) return;
    if (error) {
      const result = error as unknown as UserResult;
      result.errors?.map((message) =>
        dispatchToast(
          <Toast>
            <ToastTitle
              action={
                <ToastTrigger>
                  <Link>Dismiss</Link>
                </ToastTrigger>
              }>
              User Fetch Failed
              </ToastTitle>
            <ToastBody key={message}>{message}</ToastBody>
          </Toast>,
          { intent: "error", timeout: 5000, position: "top" }
        )
      )
      return;
    }
    if (!data) return;
    const result = data as unknown as UserResult;
    setUser(result?.user ?? null);
    navigate({ to: "/" });
  }, [data, error, accessToken])

  const loginMutation = useMutation({
    ...postApiVbyVersionAuthLoginMutation(),
    onError: (error) => {
      const result = error as unknown as AuthResult;
      result.errors?.map((message) => {
        dispatchToast(
          <Toast>
            <ToastTitle
              action={
                <ToastTrigger>
                  <Link>Dismiss</Link>
                </ToastTrigger>
              }>
              Login Failed
              </ToastTitle>
            <ToastBody key={message}>{message}</ToastBody>
          </Toast>,
          { intent: "error", timeout: 5000, position: "top" }
        )
      })
    },
    onSuccess: (data) => {
      const result = data as unknown as AuthResult;
      login(result.accessToken!, result.refreshToken!);
    }
  })
  
  return (
    <div style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1, height: "100%",
        margin: "1em",
        alignItems: "center"
      }}>
      <h1>Login</h1>
      <Toaster toasterId={toasterId} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}>
          <Button onClick={() => 
          {
            setUseEmail((prev) => {
              const next = !prev;

              if (next) {
                form.setFieldValue("userName", "");
              } else {
                form.setFieldValue("email", "");
              }
              form.setFieldValue("password", "")

              return next;
            })
          }}
            appearance='primary' style={{ marginBottom: "1em", marginTop: "1em" }}>
            {useEmail ? "Use username to log in" : "Use email to log in"}
          </Button>
          {useEmail
          ? <div>
              <form.Field name="email">
                {(field) => (
                  <div style={{ display: "flex", flexDirection: "column", maxWidth: "20em" }}>
                    <Label htmlFor='field.email'>Email</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      type='email'
                      onChange={(e) => field.handleChange(e.target.value)} />
                  </div>
                )}
              </form.Field>
            </div>
          : <div>
              <form.Field name="userName">
                {(field) => (
                  <div style={{ display: "flex", flexDirection: "column", maxWidth: "20em" }}>
                    <Label htmlFor='field.userName'>Username</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      type='text'
                      onChange={(e) => field.handleChange(e.target.value)} />
                  </div>
                )}
              </form.Field>
            </div>
        }
          <form.Field name="password">
            {(field) => (
              <div style={{ display: "flex", flexDirection: "column", maxWidth: "20em" }}>
                <Label htmlFor='field.password'>Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  type='password'
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur} />
              </div>
            )}
          </form.Field>
          <div style={{ display: "flex", flexDirection: "column", marginTop: "1em" }}>
            <Label style={{ minWidth: "20em" }}>
              Don't have an account?<br />
              <RouterLink to='/register'>Register here.</RouterLink>
            </Label>
            <Button type='submit' appearance='primary' style={{ marginTop: "1em", maxWidth: "20em" }}
              disabled={!form.state.isValid || form.state.isSubmitting}>
                Log in
            </Button>
          </div>
        </form>
    </div>
  )
}
