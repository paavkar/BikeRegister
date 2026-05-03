import {
    Button,
    Card,
    Label,
    Carousel,
    CarouselViewport,
    CarouselSlider,
    CarouselNavContainer,
    CarouselNav,
    CarouselNavButton,
    Text,
    Divider,
    CardHeader,
    Body1,
    CardPreview,
    Spinner,
    Image,
    CarouselCard,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import type { Registration } from '../types';
import { useNavigate } from '@tanstack/react-router';
import { ArrowSquareUpRightRegular } from '@fluentui/react-icons';
import { useMediaQuery } from '../services/useMediaQuery';

interface RegistrationProps {
    registration: Registration;
}

export function RegistrationCard({ registration }: RegistrationProps) {
    const { t } = useTranslation();
    const navigate = useNavigate({ from: '/' });
    const isSmall = useMediaQuery('(max-width: 600px)');

    return (
        <>
            <Card key={registration.id} style={{ marginTop: '1em' }}>
                {registration.images.length > 0 ? (
                    <Carousel
                        groupSize={1}
                        circular
                        style={{
                            maxWidth: isSmall ? '99%' : '30em',
                            justifySelf: 'center',
                        }}
                    >
                        <CarouselViewport>
                            <CarouselSlider>
                                <CarouselSlider>
                                    {registration.images.map((image) => (
                                        <CarouselCard key={image.id}>
                                            <Image
                                                key={image.originalFileName}
                                                title={image.originalFileName}
                                                fit='contain'
                                                src={image.imageUrl}
                                            />
                                        </CarouselCard>
                                    ))}
                                </CarouselSlider>
                            </CarouselSlider>
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
                ) : null}
                <Button
                    title={t('openDetails')}
                    icon={<ArrowSquareUpRightRegular />}
                    onClick={() =>
                        navigate({ to: `/registrations/${registration.id}` })
                    }
                />
                <Label>
                    {`${registration.brand} ${registration.model ? registration.model : ''}`}
                </Label>
                <Label>{registration.city}</Label>
                <Label>{registration.district}</Label>
                <Label>
                    {`${t('stolenOn')} ${new Date(`${registration.dateStolen}`).toDateString()}`}
                </Label>
                <Label>
                    {registration.user.name
                        ? registration.user.name
                        : registration.user.userName}
                </Label>
            </Card>
        </>
    );
}
