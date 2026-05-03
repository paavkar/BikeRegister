import {
    createRootRoute,
    Link,
    Outlet,
    useNavigate,
} from '@tanstack/react-router';
import { useAuthStore } from '../state/authStore';
import {
    Menu,
    MenuTrigger,
    MenuPopover,
    MenuList,
    MenuItem,
    Persona,
    Label,
} from '@fluentui/react-components';
import {
    PersonRegular,
    SettingsRegular,
    DoorArrowRightRegular,
    LocalLanguageRegular,
} from '@fluentui/react-icons';
import { useMutation } from '@tanstack/react-query';
import { revokeRefreshMutation } from '../hey-api/@tanstack/react-query.gen';
import { useTranslation } from 'react-i18next';

export const Route = createRootRoute({
    component: RootComponent,
});

const linkStyle = {
    fontWeight: 500,
    fontSize: '1.5em',
    padding: '0.5em',
    textDecoration: 'none',
    color: 'inherit',
};

function RootComponent() {
    const isAuthenticated = useAuthStore((state) => state.accessToken !== null);
    const refreshToken = useAuthStore((state) => state.refreshToken);
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const refreshRevokeMutation = useMutation({
        ...revokeRefreshMutation(),
        onSuccess: (_data) => {
            navigate({ to: '/' });
        },
    });

    const handleLogout = () => {
        logout();
        refreshRevokeMutation.mutate({
            body: {
                refreshToken: refreshToken!,
            },
            path: { version: '1' },
        });
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const LanguageSubMenu = () => {
        return (
            <Menu>
                <MenuTrigger>
                    <MenuItem icon={<LocalLanguageRegular />}>
                        {t('uiLanguage')}
                    </MenuItem>
                </MenuTrigger>

                <MenuPopover>
                    <MenuList>
                        <MenuItem onClick={() => changeLanguage('fi')}>
                            suomi
                        </MenuItem>
                        <MenuItem onClick={() => changeLanguage('en')}>
                            English
                        </MenuItem>
                    </MenuList>
                </MenuPopover>
            </Menu>
        );
    };

    return (
        <>
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    background: 'green',
                    zIndex: 100,
                    padding: '0.4em',
                }}
            >
                <nav style={{ display: 'flex', gap: '1em' }}>
                    <Link to='/' style={linkStyle}>
                        BikeRegister
                    </Link>
                    {!isAuthenticated && (
                        <Link to='/login' style={linkStyle}>
                            {t('login')}
                        </Link>
                    )}
                    {!isAuthenticated && (
                        <Link to='/register' style={linkStyle}>
                            {t('register')}
                        </Link>
                    )}
                    {isAuthenticated && (
                        <div
                            style={{
                                marginLeft: 'auto',
                                alignContent: 'center',
                                marginRight: '1em',
                            }}
                        >
                            <Menu positioning={{ autoSize: true }}>
                                <MenuTrigger>
                                    <div
                                        style={{
                                            cursor: 'pointer',
                                            display: 'flex',
                                            gap: '0.5em',
                                            flexDirection: 'row',
                                        }}
                                    >
                                        <Persona
                                            avatar={{
                                                image: {
                                                    src: user?.profilePhotoUrl
                                                        ? user.profilePhotoUrl
                                                        : '',
                                                },
                                            }}
                                        />
                                        <Label style={{ cursor: 'pointer' }}>
                                            {user?.name || user?.userName}
                                        </Label>
                                    </div>
                                </MenuTrigger>

                                <MenuPopover>
                                    <MenuList>
                                        <MenuItem
                                            onClick={() =>
                                                navigate({ to: '/profile' })
                                            }
                                            icon={<PersonRegular />}
                                        >
                                            {t('profile')}
                                        </MenuItem>
                                        <MenuItem icon={<SettingsRegular />}>
                                            {t('settings')}
                                        </MenuItem>
                                        <LanguageSubMenu />
                                        <MenuItem
                                            icon={<DoorArrowRightRegular />}
                                            onClick={() => handleLogout()}
                                        >
                                            {t('logOut')}
                                        </MenuItem>
                                    </MenuList>
                                </MenuPopover>
                            </Menu>
                        </div>
                    )}
                </nav>
            </div>
            <Outlet />
        </>
    );
}
