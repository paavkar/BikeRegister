import { revalidateLogic, useForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    registerMutation,
    authenticatedUserOptions,
} from '../hey-api/@tanstack/react-query.gen';
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
    Link,
} from '@fluentui/react-components';
import {
    createFileRoute,
    Link as RouterLink,
    useNavigate,
    useRouter,
} from '@tanstack/react-router';
import type { AuthResult, UserResult } from '../types';
import { useAuthStore } from '../state/authStore';
import { useEffect } from 'react';
import { createClient } from '../hey-api/client';
import { getFullLocale } from '../services/localeService';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/register')({
    component: RegisterComponent,
});

function RegisterComponent() {
    const toasterId = useId('toaster');
    const { dispatchToast } = useToastController(toasterId);
    const login = useAuthStore((state) => state.login);
    const setUser = useAuthStore((state) => state.setUser);
    const accessToken = useAuthStore((state) => state.accessToken);
    const navigate = useNavigate({ from: '/register' });
    const { t } = useTranslation();
    const router = useRouter();

    const registerSchema = z
        .object({
            email: z.email(t('validEmail')),
            userName: z.string().min(3, t('usernameLength')),
            password: z
                .string()
                .min(8, t('passwordLength'))
                .regex(/[A-Z]/, t('passwordUppercase'))
                .regex(/[a-z]/, t('passwordLowercase'))
                .regex(/[0-9]/, t('passwordNumber'))
                .regex(/[@$!%*?&]/, t('passwordSpecial')),
            confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: t('passwordMatch'),
            path: ['confirmPassword'],
        });

    const localClient = createClient({
        baseUrl: 'https://localhost:26786/',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Accept-Language': getFullLocale(),
        },
    });

    const form = useForm({
        defaultValues: {
            email: '',
            userName: '',
            password: '',
            confirmPassword: '',
        },
        validationLogic: revalidateLogic(),
        validators: {
            onDynamic: registerSchema,
        },
        onSubmit: async ({ value }) => {
            await register.mutateAsync({
                body: {
                    email: value.email,
                    userName: value.userName,
                    password: value.password,
                    origin: router.origin,
                },
                path: { version: '1' },
            });
        },
    });

    const { data, error } = useQuery({
        ...authenticatedUserOptions({
            client: localClient,
            path: { version: '1' },
        }),
        enabled: accessToken !== null,
    });

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
                                    <Link>{t('dismiss')}</Link>
                                </ToastTrigger>
                            }
                        >
                            {t('userFetchFail')}
                        </ToastTitle>
                        <ToastBody key={message}>{message}</ToastBody>
                    </Toast>,
                    { intent: 'error', timeout: 5000, position: 'top' },
                ),
            );
            return;
        }
        if (!data) return;
        const result = data as unknown as UserResult;
        setUser(result?.user!);
        navigate({ to: '/' });
    }, [data, error, accessToken]);

    const register = useMutation({
        ...registerMutation(),
        onError: (error) => {
            const result = error as unknown as AuthResult;
            result.errors?.map((message) => {
                dispatchToast(
                    <Toast>
                        <ToastTitle
                            action={
                                <ToastTrigger>
                                    <Link>{t('dismiss')}</Link>
                                </ToastTrigger>
                            }
                        >
                            {t('registerFailed')}
                        </ToastTitle>
                        <ToastBody key={message}>{message}</ToastBody>
                    </Toast>,
                    { intent: 'error', timeout: 5000, position: 'top' },
                );
            });
        },
        onSuccess: (data) => {
            const result = data as unknown as AuthResult;
            login(result.accessToken!, result.refreshToken!);
        },
    });

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                height: '100%',
                margin: '1em',
                alignItems: 'center',
            }}
        >
            <h1>{t('register')}</h1>
            <Toaster toasterId={toasterId} />
            <form
                style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void form.handleSubmit();
                }}
            >
                <form.Field name='email'>
                    {(field) => (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                maxWidth: '20em',
                            }}
                        >
                            <Label htmlFor='field.email'>{t('email')}</Label>
                            <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                type='email'
                                onChange={(e) =>
                                    field.handleChange(e.target.value)
                                }
                                onBlur={field.handleBlur}
                            />
                            {field.state.meta.errors.length > 0 && (
                                <em style={{ color: 'red', fontSize: '0.9em' }}>
                                    {field.state.meta.errors.map((error) => (
                                        <p>{error?.message}</p>
                                    ))}
                                </em>
                            )}
                        </div>
                    )}
                </form.Field>
                <form.Field name='userName'>
                    {(field) => (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                maxWidth: '20em',
                            }}
                        >
                            <Label htmlFor='field.userName'>
                                {t('userName')}
                            </Label>
                            <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                type='text'
                                onChange={(e) =>
                                    field.handleChange(e.target.value)
                                }
                                onBlur={field.handleBlur}
                            />
                            {field.state.meta.errors.length > 0 && (
                                <em style={{ color: 'red', fontSize: '0.9em' }}>
                                    {field.state.meta.errors.map((error) => (
                                        <p>{error?.message}</p>
                                    ))}
                                </em>
                            )}
                        </div>
                    )}
                </form.Field>
                <form.Field name='password'>
                    {(field) => (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                maxWidth: '20em',
                            }}
                        >
                            <Label htmlFor='field.password'>
                                {t('password')}
                            </Label>
                            <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                type='password'
                                onChange={(e) =>
                                    field.handleChange(e.target.value)
                                }
                                onBlur={field.handleBlur}
                            />
                            {field.state.meta.errors.length > 0 && (
                                <em style={{ color: 'red', fontSize: '0.9em' }}>
                                    {field.state.meta.errors.map((error) => (
                                        <p>{error?.message}</p>
                                    ))}
                                </em>
                            )}
                        </div>
                    )}
                </form.Field>
                <form.Field name='confirmPassword'>
                    {(field) => (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                maxWidth: '20em',
                            }}
                        >
                            <Label htmlFor='field.confirmPassword'>
                                {t('confirmPassword')}
                            </Label>
                            <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                type='password'
                                onChange={(e) =>
                                    field.handleChange(e.target.value)
                                }
                                onBlur={field.handleBlur}
                            />
                            {field.state.meta.errors.length > 0 && (
                                <em style={{ color: 'red', fontSize: '0.9em' }}>
                                    {field.state.meta.errors.map((error) => (
                                        <p>{error?.message}</p>
                                    ))}
                                </em>
                            )}
                        </div>
                    )}
                </form.Field>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Label style={{ maxWidth: '20em' }}>
                        {t('alreadyAccount')}{' '}
                        <RouterLink to='/login'>{t('loginHere')}</RouterLink>
                    </Label>
                    <Button
                        type='submit'
                        appearance='primary'
                        style={{ marginTop: '1em', maxWidth: '20em' }}
                        disabled={
                            !form.state.isValid || form.state.isSubmitting
                        }
                    >
                        {t('registerVerb')}
                    </Button>
                </div>
            </form>
        </div>
    );
}
