import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './ui/App';

const el = document.getElementById('root');
if (!el) throw new Error('Missing root element');

createRoot(el).render(<App />);
