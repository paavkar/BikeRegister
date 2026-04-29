import { revalidateLogic, useForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { postApiVbyVersionAuthRegisterMutation, getApiVbyVersionUserGetAuthenticatedOptions } from '../hey-api/@tanstack/react-query.gen';
import { z } from 'zod';
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
import { useEffect } from 'react';
import { createClient } from '../hey-api/client';
import { getFullLocale } from '../services/localeService';

export const Route = createFileRoute('/register')({
  component: RegisterComponent,
})

const registerSchema = z.object({
  email: z.email("Please enter a valid email address"),
  userName: z.string().min(3, "User name must be at least 3 characters long"),
  password: z.string().min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"]
});

function RegisterComponent() {
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);
  const login = useAuthStore((state) => state.login);
  const setUser = useAuthStore((state) => state.setUser);
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate({ from: "/register" });

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
        confirmPassword: "",
      },
      validationLogic: revalidateLogic(),
      validators: {
        onDynamic: registerSchema
      },
      onSubmit: async ({ value }) => {
        await register.mutateAsync({
            body: {
              email: value.email,
              userName: value.userName,
              password: value.password,
            },
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
  }, [data, error])

  const register = useMutation({
    ...postApiVbyVersionAuthRegisterMutation(),
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
              Registration Failed
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
      <h1>Register</h1>
      <Toaster toasterId={toasterId} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}>
          <form.Field name="email">
            {(field) => (
              <div style={{ display: "flex", flexDirection: "column", maxWidth: "20em" }}>
                <Label htmlFor='field.email' >Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  type='email'
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur} />
                  {field.state.meta.errors.length > 0 && (
                    <em style={{ color: 'red', fontSize: '0.9em' }}>
                      {field.state.meta.errors.map((error) => <p>{error?.message}</p>)}
                    </em>
                  )}
              </div>
            )}
          </form.Field>
          <form.Field name="userName">
            {(field) => (
              <div style={{ display: "flex", flexDirection: "column", maxWidth: "20em" }}>
                <Label htmlFor='field.userName'>User Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  type='text'
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur} />
                  {field.state.meta.errors.length > 0 && (
                    <em style={{ color: 'red', fontSize: '0.9em' }}>
                      {field.state.meta.errors.map((error) => <p>{error?.message}</p>)}
                    </em>
                  )}
              </div>
            )}
          </form.Field>
          <form.Field name="password">
            {(field) => (
              <div style={{ display: "flex", flexDirection: "column", maxWidth: "20em" }}>
                <Label htmlFor='field.password' >Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  type='password'
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur} />
                  {field.state.meta.errors.length > 0 && (
                    <em style={{ color: 'red', fontSize: '0.9em' }}>
                      {field.state.meta.errors.map((error) => <p>{error?.message}</p>)}
                    </em>
                  )}
              </div>
            )}
          </form.Field>
          <form.Field name="confirmPassword">
            {(field) => (
              <div style={{ display: "flex", flexDirection: "column", maxWidth: "20em" }}>
                <Label htmlFor='field.confirmPassword'>Confirm Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  type='password'
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur} />
                  {field.state.meta.errors.length > 0 && (
                    <em style={{ color: 'red', fontSize: '0.9em' }}>
                      {field.state.meta.errors.map((error) => <p>{error?.message}</p>)}
                    </em>
                  )}
              </div>
            )}
          </form.Field>
          <div style={{ display: "flex", flexDirection: "column", marginTop: "1em" }}>
            <Label style={{ maxWidth: "20em" }}>Already have an account? <RouterLink to='/login'>Log in here.</RouterLink></Label>
            <Button type='submit' appearance='primary' style={{ marginTop: "1em", maxWidth: "20em" }}
              disabled={!form.state.isValid || form.state.isSubmitting}>
                Register
            </Button>
          </div>
        </form>
    </div>
  );
}