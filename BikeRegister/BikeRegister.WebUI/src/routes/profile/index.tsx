import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../state/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '../../hey-api/client';
import {
    postApiVbyVersionAuthRefreshMutation,
    getApiVbyVersionUserGetAuthenticatedOptions,
} from '../../hey-api/@tanstack/react-query.gen';
import {
    Button,
    Toaster,
    Toast,
    ToastTitle,
    ToastBody,
    useId,
    useToastController,
    ToastTrigger,
    Link,
    Text,
} from '@fluentui/react-components';
import { EditRegular } from '@fluentui/react-icons';
import type { AppUser, AuthResult, UserResult } from '../../types';
import { useNavigate } from '@tanstack/react-router';
import { getFullLocale } from '../../services/localeService';
import { isPlainEmptyObject } from '../../services/objectService';
import type { JwtRefreshRequest } from '../../hey-api';

export const Route = createFileRoute('/profile/')({
    component: RouteComponent,
});

function RouteComponent() {
    let accessToken = useAuthStore((state) => state.accessToken);
    let refreshToken = useAuthStore((state) => state.refreshToken);
    const [user, setLocalUser] = useState<AppUser | null>();
    const { t } = useTranslation();
    const toasterId = useId('toaster');
    const { dispatchToast } = useToastController(toasterId);
    const navigate = useNavigate({ from: '/profile/' });
    const setUser = useAuthStore((state) => state.setUser);
    const login = useAuthStore((state) => state.login);
    const queryClient = useQueryClient();

    const localClient = createClient({
        baseUrl: 'https://localhost:26786/',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Accept-Language': getFullLocale(),
        },
    });

    const { data, error } = useQuery({
        ...getApiVbyVersionUserGetAuthenticatedOptions({
            client: localClient,
            path: { version: '1' },
        }),
        retry: (failureCount, error) => {
            /**
             * the likely cause for an empty error object is
             * error 401, meaning access token has expired
             */
            var empty = isPlainEmptyObject(error);
            if (empty && failureCount < 2) {
                refresh();
                return true;
            }
            return false;
        },
    });

    const refresh = async () => {
        const request: JwtRefreshRequest = {
            refreshToken: refreshToken,
        };
        await refreshMutation.mutateAsync({
            body: request,
            path: { version: '1' },
            client: localClient,
        });
    };

    useEffect(() => {
        if (!accessToken) {
            navigate({ to: '/' });
            return;
        }
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
            navigate({ to: '/' });
            return;
        }
        if (data) {
            const result = data as unknown as UserResult;
            setUser(result.user);
            setLocalUser(result.user);
            document.title = `${user?.userName} - BikeRegister`;
        }
    }, [data, error]);

    const refreshMutation = useMutation({
        ...postApiVbyVersionAuthRefreshMutation(),
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
                            {t('refreshFailed')}
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
            accessToken = result.accessToken;
            refreshToken = result.refreshToken!;

            queryClient.invalidateQueries({
                queryKey: getApiVbyVersionUserGetAuthenticatedOptions({
                    client: localClient,
                    path: { version: '1' },
                }).queryKey,
            });
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
            <h1>{`${t('helloUser')} ${user?.userName}`}</h1>
            <Toaster toasterId={toasterId} />
        </div>
    );
}
