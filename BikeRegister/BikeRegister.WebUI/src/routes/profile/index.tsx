import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../state/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '../../hey-api/client';
import {
    refreshLoginMutation,
    authenticatedUserOptions,
    markStolenMutation,
    markNotStolenMutation,
    deleteRegistrationMutation,
    uploadProfilePhotoMutation,
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
    Table,
    TableHeader,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Image,
} from '@fluentui/react-components';
import {
    EditRegular,
    DeleteRegular,
    ImageAddRegular,
    ArrowUploadRegular,
} from '@fluentui/react-icons';
import type {
    AppUser,
    AuthResult,
    Registration,
    UserResult,
    RegistrationResult,
    ImageResult,
} from '../../types';
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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const frameType: Record<number, string> = {
        0: t('other'),
        1: t('road'),
        2: t('mtb'),
        3: t('hybrid'),
        4: t('cityBike'),
        5: t('electric'),
        6: t('fatbike'),
    };

    const localClient = createClient({
        baseUrl: 'https://localhost:26786/',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Accept-Language': getFullLocale(),
        },
    });

    const handleSingleUpload = () => {
        if (!selectedFile) return;

        profilePhotoUpload.mutate({
            body: {
                images: [selectedFile],
            },
            path: {
                version: '1',
                userId: user!.id,
            },
            client: localClient,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const profilePhotoUpload = useMutation({
        ...uploadProfilePhotoMutation(),
        onError: (error) => {
            const result = error as unknown as ImageResult;
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
                            {t('profilePhotoUploadFail')}
                        </ToastTitle>
                        <ToastBody key={message}>{message}</ToastBody>
                    </Toast>,
                    { intent: 'error', timeout: 5000, position: 'top' },
                );
            });
        },
        onSuccess: (data) => {
            const result = data as unknown as ImageResult;
            user!.profilePhotoUrl = result.blobUri;

            dispatchToast(
                <Toast>
                    <ToastTitle
                        action={
                            <ToastTrigger>
                                <Link>{t('dismiss')}</Link>
                            </ToastTrigger>
                        }
                    >
                        {t('profilePhotoUploadSuccess')}
                    </ToastTitle>
                    <ToastBody key={result.blobUri}>
                        {t('profilePhotoUploaded')}
                    </ToastBody>
                </Toast>,
                { intent: 'success', timeout: 5000, position: 'top' },
            );
            setSelectedFile(null);
        },
    });

    const useMarkNotStolenMutation = useMutation({
        ...markNotStolenMutation(),
        onError: (error) => {
            const result = error as unknown as RegistrationResult;
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
                            {t('reportNotStolenFailed')}
                        </ToastTitle>
                        <ToastBody key={message}>{message}</ToastBody>
                    </Toast>,
                    { intent: 'error', timeout: 5000, position: 'top' },
                );
            });
        },
        onSuccess: (data) => {
            const result = data as unknown as RegistrationResult;
            const registration = user?.registrations.find(
                (r) => r.id == result.registrationId,
            );
            registration!.isStolen = false;
            registration!.dateStolen = null;
            dispatchToast(
                <Toast>
                    <ToastTitle
                        action={
                            <ToastTrigger>
                                <Link>{t('dismiss')}</Link>
                            </ToastTrigger>
                        }
                    >
                        {t('reportNotStolenSuccess')}
                    </ToastTitle>
                    <ToastBody key={'message'}>
                        {t('markNotStolenSuccess')}
                    </ToastBody>
                </Toast>,
                { intent: 'success', timeout: 5000, position: 'top' },
            );
        },
    });

    const useMarkStolenMutation = useMutation({
        ...markStolenMutation(),
        onError: (error) => {
            const result = error as unknown as RegistrationResult;
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
                            {t('reportStolenFailed')}
                        </ToastTitle>
                        <ToastBody key={message}>{message}</ToastBody>
                    </Toast>,
                    { intent: 'error', timeout: 5000, position: 'top' },
                );
            });
        },
        onSuccess: (data) => {
            const result = data as unknown as RegistrationResult;
            const registration = user?.registrations.find(
                (r) => r.id == result.registrationId,
            );
            registration!.isStolen = true;
            registration!.dateStolen = result.dateNow;
            dispatchToast(
                <Toast>
                    <ToastTitle
                        action={
                            <ToastTrigger>
                                <Link>{t('dismiss')}</Link>
                            </ToastTrigger>
                        }
                    >
                        {t('reportStolenSuccess')}
                    </ToastTitle>
                    <ToastBody key={'message'}>
                        {t('markStolenSuccess')}
                    </ToastBody>
                </Toast>,
                { intent: 'success', timeout: 5000, position: 'top' },
            );
        },
    });

    const deleteRegistration = useMutation({
        ...deleteRegistrationMutation(),
        onError: (error) => {
            const result = error as unknown as RegistrationResult;
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
                            {t('reportStolenFailed')}
                        </ToastTitle>
                        <ToastBody key={message}>{message}</ToastBody>
                    </Toast>,
                    { intent: 'error', timeout: 5000, position: 'top' },
                );
            });
        },
        onSuccess: (data) => {
            const result = data as unknown as RegistrationResult;
            user!.registrations = user!.registrations.filter(
                (r) => r.id != result.registrationId,
            );
            dispatchToast(
                <Toast>
                    <ToastTitle
                        action={
                            <ToastTrigger>
                                <Link>{t('dismiss')}</Link>
                            </ToastTrigger>
                        }
                    >
                        {t('reportStolenSuccess')}
                    </ToastTitle>
                    <ToastBody key={'message'}>
                        {t('markStolenSuccess')}
                    </ToastBody>
                </Toast>,
                { intent: 'success', timeout: 5000, position: 'top' },
            );
        },
    });

    async function handleDelete(registration: Registration) {
        await deleteRegistration.mutateAsync({
            path: { version: '1', id: registration.id },
            client: localClient,
        });
    }

    async function refresh(error: unknown) {
        var empty = isPlainEmptyObject(error);
        /**
         * if the error object is empty, the likely cause for it
         * was code 401 Unauthorized (access token expired)
         */
        if (empty) {
            const request: JwtRefreshRequest = {
                refreshToken: refreshToken,
            };
            await refreshMutation.mutateAsync({
                body: request,
                path: { version: '1' },
                client: localClient,
            });
        }
    }

    async function reportRegistration(registration: Registration) {
        if (registration?.isStolen) {
            try {
                await useMarkNotStolenMutation.mutateAsync({
                    path: { version: '1', id: registration.id },
                    client: localClient,
                });
            } catch (error) {
                refresh(error);
            }
        } else {
            try {
                await useMarkStolenMutation.mutateAsync({
                    path: { version: '1', id: registration.id },
                    client: localClient,
                });
            } catch (error) {
                refresh(error);
            }
        }
    }

    const { data, error } = useQuery({
        ...authenticatedUserOptions({
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
                refresh(error);
                return true;
            }
            return false;
        },
    });

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
            document.title = `${result.user?.userName} - BikeRegister`;
        }
    }, [data, error]);

    const refreshMutation = useMutation({
        ...refreshLoginMutation(),
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
                queryKey: authenticatedUserOptions({
                    client: localClient,
                    path: { version: '1' },
                }).queryKey,
            });
        },
    });

    const FilePreview = () => {
        if (!selectedFile) return;
        return (
            <div
                style={{
                    display: 'flex',
                    gap: '20px',
                    overflowX: 'scroll',
                    padding: '20px',
                    maxWidth: '35em',
                }}
            >
                <div
                    key={`${selectedFile?.name}`}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        border: `1px solid`,
                        padding: '10px',
                    }}
                >
                    <Image
                        key={selectedFile?.name}
                        src={URL.createObjectURL(selectedFile!)}
                        alt={selectedFile?.name}
                        width={200}
                        height={200}
                        fit='cover'
                    />
                    <Button
                        appearance='subtle'
                        icon={<DeleteRegular />}
                        onClick={() => {}}
                        color='danger'
                    />
                </div>
            </div>
        );
    };

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
            <div>
                <FilePreview />
                <input
                    id='pfpInput'
                    hidden
                    type='file'
                    accept='image/*'
                    onChange={handleFileChange}
                />
                <Button
                    icon={<ImageAddRegular />}
                    onClick={() => document.getElementById('pfpInput')?.click()}
                />

                <Button
                    icon={<ArrowUploadRegular />}
                    onClick={() => handleSingleUpload()}
                />
            </div>
            <div
                style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}
            >
                <Text size={500}>{t('myRegistrations')}</Text>
                {user?.registrations.length! > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell>{t('brand')}</TableHeaderCell>
                                <TableHeaderCell>{t('model')}</TableHeaderCell>
                                <TableHeaderCell>
                                    {t('modelYear')}
                                </TableHeaderCell>
                                <TableHeaderCell>
                                    {t('frameType')}
                                </TableHeaderCell>
                                <TableHeaderCell>
                                    {t('primaryColour')}
                                </TableHeaderCell>
                                <TableHeaderCell>
                                    {t('secondaryColour')}
                                </TableHeaderCell>
                                <TableHeaderCell>
                                    {t('serialNumber')}
                                </TableHeaderCell>
                                <TableHeaderCell>{t('city')}</TableHeaderCell>
                                <TableHeaderCell>
                                    {t('district')}
                                </TableHeaderCell>
                                <TableHeaderCell>
                                    {t('markedStolen')}
                                </TableHeaderCell>
                                <TableHeaderCell>
                                    {t('dateStolen')}
                                </TableHeaderCell>
                                <TableHeaderCell>
                                    {t('actions')}
                                </TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {user?.registrations.map((element) => (
                                <TableRow key={element.id}>
                                    <TableCell>{element.brand}</TableCell>
                                    <TableCell>{element.model}</TableCell>
                                    <TableCell>{element.modelYear}</TableCell>
                                    <TableCell>
                                        {frameType[element.frameType]}
                                    </TableCell>
                                    <TableCell>
                                        {element.primaryColour}
                                    </TableCell>
                                    <TableCell>
                                        {element.secondaryColour}
                                    </TableCell>
                                    <TableCell>
                                        {element.serialNumber}
                                    </TableCell>
                                    <TableCell>{element.city}</TableCell>
                                    <TableCell>{element.district}</TableCell>
                                    <TableCell>
                                        {element.isStolen ? t('yes') : t('no')}
                                    </TableCell>
                                    <TableCell>
                                        {element.isStolen
                                            ? new Date(
                                                  `${element.dateStolen}`,
                                              ).toDateString()
                                            : t('notStolen')}
                                    </TableCell>
                                    <TableCell>
                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: '1em',
                                            }}
                                        >
                                            <Button
                                                title={
                                                    element.isStolen
                                                        ? t('reportNotStolen')
                                                        : t('reportStolen')
                                                }
                                                icon={<EditRegular />}
                                                onClick={() =>
                                                    reportRegistration(element)
                                                }
                                            ></Button>
                                            <Button
                                                title={t('delete')}
                                                icon={<DeleteRegular />}
                                                style={{ color: 'red' }}
                                                onClick={() =>
                                                    handleDelete(element)
                                                }
                                            ></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div>
                        <Text>{t('noRegistrations')}</Text>
                    </div>
                )}
            </div>
        </div>
    );
}
