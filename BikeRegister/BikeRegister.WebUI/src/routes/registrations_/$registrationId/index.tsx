import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../state/authStore';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createClient } from '../../../hey-api/client';
import { getFullLocale } from '../../../services/localeService';
import {
    getApiVbyVersionRegistrationSingleByIdOptions,
    patchApiVbyVersionRegistrationMarkStolenByIdMutation,
    patchApiVbyVersionRegistrationMarkNotStolenByIdMutation,
    postApiVbyVersionAuthRefreshMutation,
} from '../../../hey-api/@tanstack/react-query.gen';
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
    Carousel,
    CarouselViewport,
    CarouselSlider,
    CarouselNavContainer,
    CarouselNav,
    CarouselNavButton,
    Text,
    Card,
    Divider,
    CardHeader,
    Body1,
    CardPreview,
    Spinner,
} from '@fluentui/react-components';
import { EditRegular } from '@fluentui/react-icons';
import type {
    Registration,
    RegistrationResult,
    AuthResult,
} from '../../../types';
import { useNavigate } from '@tanstack/react-router';
import { useMediaQuery } from '../../../services/useMediaQuery';
import type { JwtRefreshRequest } from '../../../hey-api';
import { isPlainEmptyObject } from '../../../services/objectService';
import { NotFound } from '../../../components/notFound';

export const Route = createFileRoute('/registrations_/$registrationId/')({
    component: RegistrationViewComponent,
});

function RegistrationViewComponent() {
    let accessToken = useAuthStore((state) => state.accessToken);
    let refreshToken = useAuthStore((state) => state.refreshToken);
    const user = useAuthStore((state) => state.user);
    const login = useAuthStore((state) => state.login);
    const { registrationId } = Route.useParams();
    const { t } = useTranslation();
    const toasterId = useId('toaster');
    const { dispatchToast } = useToastController(toasterId);
    const [registration, setRegistration] = useState<Registration | null>(null);
    const navigate = useNavigate({ from: '/registrations/$registrationId/' });
    const isSmall = useMediaQuery('(max-width: 600px)');
    const [isLoading, setIsLoading] = useState(true);

    const localClient = createClient({
        baseUrl: 'https://localhost:26786/',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Accept-Language': getFullLocale(),
        },
    });

    const frameType: Record<number, string> = {
        0: t('other'),
        1: t('road'),
        2: t('mtb'),
        3: t('hybrid'),
        4: t('cityBike'),
        5: t('electric'),
        6: t('fatbike'),
    };

    const frameSizeUnit: Record<number, string> = {
        0: 'cm',
        1: '"',
    };

    const { data, error } = useQuery({
        ...getApiVbyVersionRegistrationSingleByIdOptions({
            client: localClient,
            path: { version: '1', id: registrationId },
        }),
    });

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

            document.getElementById('reportBtn')?.click();
        },
    });

    const markNotStolenMutation = useMutation({
        ...patchApiVbyVersionRegistrationMarkNotStolenByIdMutation(),
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
        onSuccess: (_data) => {
            registration!.isStolen = false;
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

    const markStolenMutation = useMutation({
        ...patchApiVbyVersionRegistrationMarkStolenByIdMutation(),
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
        onSuccess: (_data) => {
            registration!.isStolen = true;
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

    async function reportRegistration() {
        if (registration?.isStolen) {
            try {
                await markNotStolenMutation.mutateAsync({
                    path: { version: '1', id: registrationId },
                    client: localClient,
                });
            } catch (error) {
                refresh(error);
            }
        } else {
            try {
                await markStolenMutation.mutateAsync({
                    path: { version: '1', id: registrationId },
                    client: localClient,
                });
            } catch (error) {
                refresh(error);
            }
        }
    }

    useEffect(() => {
        if (error) {
            const result = error as unknown as RegistrationResult;
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
                            {t('registrationFetchFail')}
                        </ToastTitle>
                        <ToastBody key={message}>{message}</ToastBody>
                    </Toast>,
                    { intent: 'error', timeout: 5000, position: 'top' },
                ),
            );
            document.title = 'BikeRegister';
            setIsLoading(false);
            return;
        }
        if (data) {
            const result = data as unknown as RegistrationResult;
            setRegistration(result.registration);
            document.title = `${result.registration!.brand} 
            ${result.registration!.model ?? ''} - BikeRegister`;
            setIsLoading(false);
        }
    }, [data, error]);

    return (
        <div style={{ margin: '1em', flexDirection: 'column' }}>
            <Toaster toasterId={toasterId} />
            {isLoading ? (
                <div>
                    <Spinner />
                </div>
            ) : registration ? (
                <div>
                    <Carousel groupSize={1} circular>
                        <CarouselViewport>
                            <CarouselSlider>{/**images here */}</CarouselSlider>
                        </CarouselViewport>
                        <CarouselNavContainer
                            layout='inline'
                            autoplayTooltip={{
                                content: t('autoplay'),
                                relationship: 'label',
                            }}
                            nextTooltip={{
                                content: t('nextImage'),
                                relationship: 'label',
                            }}
                            prevTooltip={{
                                content: t('prevImage'),
                                relationship: 'label',
                            }}
                        >
                            <CarouselNav>
                                {(index) => (
                                    <CarouselNavButton
                                        aria-label={`Carousel Nav Button ${index}`}
                                    />
                                )}
                            </CarouselNav>
                        </CarouselNavContainer>
                    </Carousel>
                    <Card
                        style={{
                            width: '99%',
                            justifySelf: 'center',
                            marginTop: '1em',
                        }}
                    >
                        <CardHeader
                            header={
                                <div
                                    style={{
                                        display: 'flex',
                                        flexGrow: 1,
                                        flexDirection: isSmall
                                            ? 'column'
                                            : 'row',
                                    }}
                                >
                                    <Body1>
                                        <Text size={800}>
                                            {t('registrationDetails')}
                                        </Text>
                                    </Body1>
                                    {user?.id == registration?.user.id ? (
                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: '1em',
                                                marginLeft: !isSmall
                                                    ? 'auto'
                                                    : '0em',
                                            }}
                                        >
                                            <Button
                                                icon={<EditRegular />}
                                                appearance='primary'
                                                id='reportBtn'
                                                style={{ height: '3em' }}
                                                onClick={() =>
                                                    reportRegistration()
                                                }
                                            >
                                                {registration?.isStolen
                                                    ? t('reportNotStolen')
                                                    : t('reportStolen')}
                                            </Button>
                                            <Button
                                                icon={<EditRegular />}
                                                appearance='primary'
                                                style={{
                                                    marginLeft: 'auto',
                                                    height: '3em',
                                                }}
                                                onClick={() =>
                                                    navigate({
                                                        to: `/registrations/${registrationId}/edit`,
                                                    })
                                                }
                                            >
                                                {t('editRegistration')}
                                            </Button>
                                        </div>
                                    ) : null}
                                </div>
                            }
                        />
                        <CardPreview style={{ padding: '1em' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: isSmall ? 'column' : 'row',
                                    gap: isSmall ? '1em' : '5em',
                                }}
                            >
                                <Text size={500} style={{ width: '8em' }}>
                                    {t('model')}
                                </Text>
                                {!isSmall ? <Divider vertical /> : null}
                                <Text size={500} style={{ width: '10em' }}>
                                    {registration?.model ?? 'N/A'}
                                </Text>
                                {isSmall ? <Divider /> : null}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: isSmall ? 'column' : 'row',
                                    gap: isSmall ? '1em' : '5em',
                                }}
                            >
                                <Text
                                    size={500}
                                    style={{
                                        width: '8em',
                                        marginTop: isSmall ? '0.5em' : 'none',
                                    }}
                                >
                                    {t('brand')}
                                </Text>
                                {!isSmall ? <Divider vertical /> : null}
                                <Text size={500} style={{ width: '10em' }}>
                                    {registration?.brand}
                                </Text>
                                {isSmall ? <Divider /> : null}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: isSmall ? 'column' : 'row',
                                    gap: isSmall ? '1em' : '5em',
                                }}
                            >
                                <Text
                                    size={500}
                                    style={{
                                        width: '8em',
                                        marginTop: isSmall ? '0.5em' : 'none',
                                    }}
                                >
                                    {t('modelYear')}
                                </Text>
                                {!isSmall ? <Divider vertical /> : null}
                                <Text size={500} style={{ width: '10em' }}>
                                    {registration?.modelYear ?? 'N/A'}
                                </Text>
                                {isSmall ? <Divider /> : null}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: isSmall ? 'column' : 'row',
                                    gap: isSmall ? '1em' : '5em',
                                }}
                            >
                                <Text
                                    size={500}
                                    style={{
                                        width: '8em',
                                        marginTop: isSmall ? '0.5em' : 'none',
                                    }}
                                >
                                    {t('frameSize')}
                                </Text>
                                {!isSmall ? <Divider vertical /> : null}
                                <Text size={500} style={{ width: '10em' }}>
                                    {`${registration?.frameSize}${frameSizeUnit[registration?.frameSizeUnit!]}`}
                                </Text>
                                {isSmall ? <Divider /> : null}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: isSmall ? 'column' : 'row',
                                    gap: isSmall ? '1em' : '5em',
                                }}
                            >
                                <Text
                                    size={500}
                                    style={{
                                        width: '8em',
                                        marginTop: isSmall ? '0.5em' : 'none',
                                    }}
                                >
                                    {t('frameType')}
                                </Text>
                                {!isSmall ? <Divider vertical /> : null}
                                <Text size={500} style={{ width: '10em' }}>
                                    {frameType[registration?.frameType!]}
                                </Text>
                                {isSmall ? <Divider /> : null}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: isSmall ? 'column' : 'row',
                                    gap: isSmall ? '1em' : '5em',
                                }}
                            >
                                <Text
                                    size={500}
                                    style={{
                                        width: '8em',
                                        marginTop: isSmall ? '0.5em' : 'none',
                                    }}
                                >
                                    {t('primaryColour')}
                                </Text>
                                {!isSmall ? <Divider vertical /> : null}
                                <Text size={500} style={{ width: '10em' }}>
                                    {registration?.primaryColour}
                                </Text>
                                {isSmall ? <Divider /> : null}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: isSmall ? 'column' : 'row',
                                    gap: isSmall ? '1em' : '5em',
                                }}
                            >
                                <Text
                                    size={500}
                                    style={{
                                        width: '8em',
                                        marginTop: isSmall ? '0.5em' : 'none',
                                    }}
                                >
                                    {t('secondaryColour')}
                                </Text>
                                {!isSmall ? <Divider vertical /> : null}
                                <Text size={500} style={{ width: '10em' }}>
                                    {registration?.secondaryColour}
                                </Text>
                                {isSmall ? <Divider /> : null}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: isSmall ? 'column' : 'row',
                                    gap: isSmall ? '1em' : '5em',
                                }}
                            >
                                <Text
                                    size={500}
                                    style={{
                                        width: '8em',
                                        marginTop: isSmall ? '0.5em' : 'none',
                                    }}
                                >
                                    {t('serialNumber')}
                                </Text>
                                {!isSmall ? <Divider vertical /> : null}
                                <Text size={500} style={{ width: '10em' }}>
                                    {registration?.serialNumber}
                                </Text>
                                {isSmall ? <Divider /> : null}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: isSmall ? 'column' : 'row',
                                    gap: isSmall ? '1em' : '5em',
                                }}
                            >
                                <Text
                                    size={500}
                                    style={{
                                        width: '8em',
                                        marginTop: isSmall ? '0.5em' : 'none',
                                    }}
                                >
                                    {t('city')}
                                </Text>
                                {!isSmall ? <Divider vertical /> : null}
                                <Text size={500} style={{ width: '10em' }}>
                                    {registration?.city}
                                </Text>
                                {isSmall ? <Divider /> : null}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: isSmall ? 'column' : 'row',
                                    gap: isSmall ? '1em' : '5em',
                                }}
                            >
                                <Text
                                    size={500}
                                    style={{
                                        width: '8em',
                                        marginTop: isSmall ? '0.5em' : 'none',
                                    }}
                                >
                                    {t('district')}
                                </Text>
                                {!isSmall ? <Divider vertical /> : null}
                                <Text size={500} style={{ width: '10em' }}>
                                    {registration?.district}
                                </Text>
                                {isSmall ? <Divider /> : null}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: isSmall ? 'column' : 'row',
                                    gap: isSmall ? '1em' : '5em',
                                }}
                            >
                                <Text
                                    size={500}
                                    style={{
                                        width: '8em',
                                        marginTop: isSmall ? '0.5em' : 'none',
                                    }}
                                >
                                    {t('description')}
                                </Text>
                                {!isSmall ? <Divider vertical /> : null}
                                <Text size={500} style={{ width: '10em' }}>
                                    {registration?.description}
                                </Text>
                                {isSmall ? <Divider /> : null}
                            </div>

                            {registration?.isStolen ? (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: isSmall
                                            ? 'column'
                                            : 'row',
                                        gap: isSmall ? '1em' : '5em',
                                    }}
                                >
                                    <Text
                                        size={500}
                                        style={{
                                            width: '8em',
                                            marginTop: isSmall
                                                ? '0.5em'
                                                : 'none',
                                        }}
                                    >
                                        {t('dateStolen')}
                                    </Text>
                                    {!isSmall ? <Divider vertical /> : null}
                                    <Text size={500} style={{ width: '10em' }}>
                                        {new Date(
                                            `${registration.dateStolen}`,
                                        ).toDateString()}
                                    </Text>
                                </div>
                            ) : null}
                        </CardPreview>
                    </Card>
                    <Card
                        style={{
                            width: isSmall ? '99%' : '45em',
                            justifySelf: 'center',
                            marginTop: '1em',
                        }}
                    >
                        <CardHeader
                            header={
                                <Body1>
                                    <Text size={800}>{t('ownerDetails')}</Text>
                                </Body1>
                            }
                        />
                        <CardPreview style={{ padding: '1em' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: isSmall ? 'column' : 'row',
                                    gap: isSmall ? '1em' : '5em',
                                }}
                            >
                                <Text size={500} style={{ width: '10em' }}>
                                    {t('name')}
                                </Text>
                                {!isSmall ? <Divider vertical /> : null}
                                <Text size={500} style={{ width: '20em' }}>
                                    {registration?.user.name}
                                </Text>
                                {isSmall ? <Divider /> : null}
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: isSmall ? 'column' : 'row',
                                    gap: isSmall ? '1em' : '5em',
                                }}
                            >
                                <Text
                                    size={500}
                                    style={{
                                        width: '10em',
                                        marginTop: isSmall ? '0.5em' : 'none',
                                    }}
                                >
                                    {t('email')}
                                </Text>
                                {!isSmall ? <Divider vertical /> : null}
                                <Text size={500} style={{ width: '20em' }}>
                                    {registration?.user.email}
                                </Text>
                                {isSmall ? <Divider /> : null}
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: isSmall ? 'column' : 'row',
                                    gap: isSmall ? '1em' : '5em',
                                }}
                            >
                                <Text
                                    size={500}
                                    style={{
                                        width: '10em',
                                        marginTop: isSmall ? '0.5em' : 'none',
                                    }}
                                >
                                    {t('phoneNumber')}
                                </Text>
                                {!isSmall ? <Divider vertical /> : null}
                                <Text size={500} style={{ width: '20em' }}>
                                    {registration?.user.phoneNumber}
                                </Text>
                                {isSmall ? <Divider /> : null}
                            </div>
                        </CardPreview>
                    </Card>
                </div>
            ) : (
                <NotFound text={t('registrationNotFound')} />
            )}
        </div>
    );
}
