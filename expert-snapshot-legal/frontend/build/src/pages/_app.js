import { jsx as _jsx } from "react/jsx-runtime";
import '../styles/cardGrid.css';
export default function MyApp({ Component, pageProps }) {
    return _jsx(Component, { ...pageProps });
}
