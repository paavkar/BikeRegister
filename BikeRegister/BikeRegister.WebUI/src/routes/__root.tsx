import { createRootRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../state/authStore';
import {
    Menu,
    MenuTrigger,
    MenuPopover,
    MenuList,
    MenuItem,
    Persona,
    Label
 } from '@fluentui/react-components';
 import {
  PersonRegular,
  SettingsRegular,
  DoorArrowRightRegular
} from "@fluentui/react-icons";


export const Route = createRootRoute({
  component: RootComponent
})

const linkStyle = {
  fontWeight: 500,
  fontSize: "1.5em",
  padding: "0.5em",
  textDecoration: "none",
  color: "inherit"
};

function RootComponent() {
    const isAuthenticated = useAuthStore((state) => state.accessToken !== null);
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();
    
    return (
        <>
            <div style={{ position: "sticky", top: 0, background: "green", zIndex: 100, padding: "0.4em" }}>
                <nav style={{ display: "flex", gap: "1em" }}>
                    <Link to="/" style={linkStyle}>BikeRegister</Link>
                    {!isAuthenticated  &&
                        <Link to="/login" style={linkStyle}>Login</Link>
                    }
                    {!isAuthenticated  &&
                        <Link to="/register" style={linkStyle}>Register</Link>
                    }
                    {isAuthenticated && (
                        <div style={{ marginLeft: "auto", alignContent: "center", marginRight: "1em" }}>
                            <Menu positioning={{ autoSize: true }}>
                                <MenuTrigger>
                                    <div style={{ cursor: "pointer", display: "flex", gap: "0.5em", flexDirection: "row" }}>
                                        <Persona avatar={user?.profilePhotoUrl} size='large' />
                                        <Label style={{ cursor: "pointer" }}>{user?.name || user?.userName}</Label>
                                    </div>
                                </MenuTrigger>

                                <MenuPopover>
                                    <MenuList>
                                        <MenuItem
                                            icon={<PersonRegular />}>
                                            Profile
                                        </MenuItem>
                                        <MenuItem icon={<SettingsRegular />}>
                                            Settings
                                        </MenuItem>
                                        <MenuItem icon={<DoorArrowRightRegular />}
                                                onClick={() => {
                                                    logout();
                                                    navigate({ to: "/" });
                                                }}>
                                            Logout
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
    )
}