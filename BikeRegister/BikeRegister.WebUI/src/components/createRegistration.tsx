import {
    addRegistrationMutation,
    refreshLoginMutation,
    uploadRegistrationImagesMutation,
} from '../hey-api/@tanstack/react-query.gen';
import {
    DialogTrigger,
    DialogTitle,
    DialogActions,
    DialogContent,
    Button,
    useToastController,
    useId,
    Toast,
    ToastTitle,
    ToastTrigger,
    Link,
    ToastBody,
    Toaster,
    Label,
    Input,
    Checkbox,
    RadioGroup,
    Radio,
    Field,
    type CheckboxOnChangeData,
    Textarea,
    Image,
} from '@fluentui/react-components';
import { ImageAddRegular, DeleteRegular } from '@fluentui/react-icons';
import { ColourPicker } from './colourPicker';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import { useTranslation } from 'react-i18next';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createClient } from '../hey-api/client';
import { getFullLocale } from '../services/localeService';
import type { RegistrationResult, AuthResult } from '../types';
import type { CreateRegistrationDto, JwtRefreshRequest } from '../hey-api';
import { useAuthStore } from '../state/authStore';
import { useState, type ChangeEvent } from 'react';
import { isPlainEmptyObject } from '../services/objectService';
import { useMediaQuery } from '../services/useMediaQuery';

export function CreateRegistration() {
    const accessToken = useAuthStore((state) => state.accessToken);
    const refreshToken = useAuthStore((state) => state.refreshToken);
    const toasterId = useId('toaster');
    const { t } = useTranslation();
    const { dispatchToast } = useToastController(toasterId);
    const [markStolen, setMarkStolen] = useState(false);
    const login = useAuthStore((state) => state.login);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const isSmall = useMediaQuery('(max-width: 600px)');

    const localClient = createClient({
        baseUrl: 'https://localhost:26786/',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Accept-Language': getFullLocale(),
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);

            // Limit to 10 images
            if (filesArray.length + selectedFiles.length > 10) {
                alert('You can only upload a maximum of 10 images.');
                return;
            }

            setSelectedFiles((prev) => [...prev, ...filesArray]);
        }
    };

    const imageUploadMutation = useMutation({
        ...uploadRegistrationImagesMutation(),
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
                            {t('addRegistrationFailed')}
                        </ToastTitle>
                        <ToastBody key={message}>{message}</ToastBody>
                    </Toast>,
                    { intent: 'error', timeout: 5000, position: 'top' },
                );
            });
        },
        onSuccess: (_data) => {
            document.getElementById('addRegisterClose')?.click();
        },
    });

    async function refresh() {
        const request: JwtRefreshRequest = {
            refreshToken: refreshToken,
        };
        await refreshMutation.mutateAsync({
            body: request,
            path: { version: '1' },
            client: localClient,
        });
    }

    const addMutation = useMutation({
        ...addRegistrationMutation(),
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
                            {t('addRegistrationFailed')}
                        </ToastTitle>
                        <ToastBody key={message}>{message}</ToastBody>
                    </Toast>,
                    { intent: 'error', timeout: 5000, position: 'top' },
                );
            });
        },
        onSuccess: (data) => {
            const result = data as unknown as RegistrationResult;

            if (selectedFiles.length == 0) {
                document.getElementById('addRegisterClose')?.click();
            } else {
                try {
                    imageUploadMutation.mutate({
                        body: {
                            images: selectedFiles,
                        },
                        path: {
                            version: '1',
                            registrationId: result.registration!.id,
                        },
                        client: localClient,
                    });
                } catch (error) {
                    var empty = isPlainEmptyObject(error);

                    if (empty) {
                        refresh();
                    }
                }
            }
        },
    });

    async function addRequest(value: CreateRegistrationDto) {
        try {
            await addMutation.mutateAsync({
                body: value,
                path: { version: '1' },
                client: localClient,
            });
        } catch (error) {
            var empty = isPlainEmptyObject(error);
            /**
             * if the error object is empty, the likely cause for it
             * was code 401 Unauthorized (access token expired)
             */
            if (empty) {
                refresh();
            }
        }
    }

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
            document.getElementById('addRegister')?.click();
        },
    });

    const form = useForm({
        defaultValues: {
            model: null,
            brand: '',
            modelYear: null,
            frameSize: 20,
            frameSizeUnit: 0,
            primaryColour: '',
            secondaryColour: '',
            serialNumber: '',
            city: '',
            district: null,
            description: null,
            isStolen: false,
            dateStolen: null,
        } as CreateRegistrationDto,
        onSubmit: async ({ value }) => {
            addRequest(value);
        },
    });

    const removeFile = (indexToRemove: number) => {
        setSelectedFiles(
            (prevFiles) =>
                prevFiles.filter((_, index) => index !== indexToRemove) ?? [],
        );
    };

    const FilePreview = () => {
        return (
            <div
                style={{
                    display: 'flex',
                    gap: '20px',
                    overflowX: 'auto',
                    padding: '20px',
                    maxWidth: isSmall ? '17em' : '35em',
                }}
            >
                {selectedFiles.map((file, index) => {
                    // Create a temporary URL for the file object
                    const imageUrl = URL.createObjectURL(file);

                    return (
                        <div
                            key={`${file.name}-${index}`}
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
                                key={index}
                                src={imageUrl}
                                alt={file.name}
                                title={file.name}
                                width={200}
                                height={200}
                                fit='cover'
                            />
                            <Button
                                appearance='subtle'
                                icon={<DeleteRegular />}
                                onClick={() => {
                                    removeFile(index);
                                }}
                                color='danger'
                            />
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            <Toaster toasterId={toasterId} />
            <DialogTitle>{t('enterBikeInformation')}</DialogTitle>
            <DialogContent>
                <form
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1em',
                    }}
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        void form.handleSubmit();
                    }}
                >
                    <Field>
                        <FilePreview />
                        <input
                            id='imageInput'
                            hidden
                            type='file'
                            multiple
                            accept='image/*'
                            onChange={handleFileChange}
                        />
                        <Button
                            icon={<ImageAddRegular />}
                            onClick={() =>
                                document.getElementById('imageInput')?.click()
                            }
                        />
                    </Field>
                    <form.Field name='model'>
                        {(field) => (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxWidth: '20em',
                                }}
                            >
                                <Label htmlFor='field.model'>
                                    {t('model')}
                                </Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type='text'
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                />
                            </div>
                        )}
                    </form.Field>
                    <form.Field name='brand'>
                        {(field) => (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxWidth: '20em',
                                }}
                            >
                                <Field required label={t('brand')}>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        type='text'
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
                                        }
                                    />
                                </Field>
                            </div>
                        )}
                    </form.Field>
                    <form.Field name='modelYear'>
                        {(field) => (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxWidth: '20em',
                                }}
                            >
                                <Field label={t('modelYear')}>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        type='number'
                                        onChange={(e) =>
                                            field.handleChange(
                                                parseInt(e.target.value),
                                            )
                                        }
                                    />
                                </Field>
                            </div>
                        )}
                    </form.Field>
                    <form.Field name='frameSize'>
                        {(field) => (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxWidth: '20em',
                                }}
                            >
                                <Field required label={t('frameSize')}>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        type='number'
                                        onChange={(e) =>
                                            field.handleChange(
                                                parseInt(e.target.value),
                                            )
                                        }
                                    />
                                </Field>
                            </div>
                        )}
                    </form.Field>
                    <form.Field name='frameSizeUnit'>
                        {(field) => (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxWidth: '20em',
                                }}
                            >
                                <Label htmlFor='field.frameSizeUnit'>
                                    {t('frameSizeUnit')}
                                </Label>
                                <RadioGroup
                                    id={field.name}
                                    name={field.name}
                                    layout='horizontal'
                                    defaultValue={'0'}
                                    onChange={(_, data) =>
                                        field.handleChange(parseInt(data.value))
                                    }
                                >
                                    <Radio value='0' label={t('centimeters')} />
                                    <Radio value='1' label={t('inches')} />
                                </RadioGroup>
                            </div>
                        )}
                    </form.Field>
                    <form.Field name='frameType'>
                        {(field) => (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxWidth: '20em',
                                }}
                            >
                                <Label htmlFor='field.frameType'>
                                    {t('frameType')}
                                </Label>
                                <RadioGroup
                                    id={field.name}
                                    name={field.name}
                                    defaultValue={'0'}
                                    onChange={(_, data) =>
                                        field.handleChange(parseInt(data.value))
                                    }
                                >
                                    <Radio value='0' label={t('other')} />
                                    <Radio value='1' label={t('road')} />
                                    <Radio value='2' label={t('mtb')} />
                                    <Radio value='3' label={t('hybrid')} />
                                    <Radio value='4' label={t('cityBike')} />
                                    <Radio value='5' label={t('electric')} />
                                    <Radio value='6' label={t('fatbike')} />
                                </RadioGroup>
                            </div>
                        )}
                    </form.Field>
                    <form.Field name='primaryColour'>
                        {(field) => (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxWidth: '20em',
                                }}
                            >
                                <Field required label={t('primaryColour')}>
                                    <ColourPicker
                                        value={field.state.value}
                                        onChange={(newHex) =>
                                            field.handleChange(newHex)
                                        }
                                    />
                                </Field>
                            </div>
                        )}
                    </form.Field>
                    <form.Field name='secondaryColour'>
                        {(field) => (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxWidth: '20em',
                                }}
                            >
                                <Field required label={t('secondaryColour')}>
                                    <ColourPicker
                                        value={field.state.value}
                                        onChange={(newHex) =>
                                            field.handleChange(newHex)
                                        }
                                    />
                                </Field>
                            </div>
                        )}
                    </form.Field>
                    <form.Field name='serialNumber'>
                        {(field) => (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxWidth: '20em',
                                }}
                            >
                                <Field required label={t('serialNumber')}>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        type='text'
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
                                        }
                                    />
                                </Field>
                            </div>
                        )}
                    </form.Field>
                    <form.Field name='city'>
                        {(field) => (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxWidth: '20em',
                                }}
                            >
                                <Field required label={t('city')}>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        type='text'
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
                                        }
                                    />
                                </Field>
                            </div>
                        )}
                    </form.Field>
                    <form.Field name='district'>
                        {(field) => (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxWidth: '20em',
                                }}
                            >
                                <Label htmlFor='field.district'>
                                    {t('district')}
                                </Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type='text'
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                />
                            </div>
                        )}
                    </form.Field>
                    <form.Field name='description'>
                        {(field) => (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxWidth: '20em',
                                }}
                            >
                                <Label htmlFor='field.description'>
                                    {t('description')}
                                </Label>
                                <Textarea
                                    id={field.name}
                                    name={field.name}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                />
                            </div>
                        )}
                    </form.Field>
                    <form.Field name='isStolen'>
                        {(field) => (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxWidth: '20em',
                                }}
                            >
                                <Checkbox
                                    label={t('isStolen')}
                                    id={field.name}
                                    name={field.name}
                                    onChange={(
                                        _ev: ChangeEvent<HTMLInputElement>,
                                        data: CheckboxOnChangeData,
                                    ) => {
                                        field.handleChange(
                                            data.checked as boolean,
                                        );
                                        setMarkStolen(!markStolen);
                                    }}
                                />
                            </div>
                        )}
                    </form.Field>
                    {markStolen ? (
                        <form.Field name='dateStolen'>
                            {(field) => (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        maxWidth: '20em',
                                    }}
                                >
                                    <Field required label={t('dateStolen')}>
                                        <DatePicker
                                            id={field.name}
                                            name={field.name}
                                            onSelectDate={(
                                                date: Date | null | undefined,
                                            ) =>
                                                field.handleChange(
                                                    date?.toISOString(),
                                                )
                                            }
                                        />
                                    </Field>
                                </div>
                            )}
                        </form.Field>
                    ) : null}
                    <button type='submit' hidden id='addRegister' />
                </form>
            </DialogContent>
            <DialogActions>
                <Button
                    appearance='primary'
                    onClick={() =>
                        document.getElementById('addRegister')?.click()
                    }
                >
                    {t('saveRegistration')}
                </Button>
                <DialogTrigger disableButtonEnhancement>
                    <Button id='addRegisterClose' appearance='secondary'>
                        {t('cancel')}
                    </Button>
                </DialogTrigger>
            </DialogActions>
        </>
    );
}
