import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { useAuthStore } from '../state/authStore';

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
                </nav>
            </div>
            <Outlet />
        </>
    )
}