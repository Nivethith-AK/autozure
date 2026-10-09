'use client';

import React from 'react';
import {
  Play,
  Globe,
  Clock,
  Zap,
  Brain,
  Code2,
  GitBranch,
  Shuffle,
  Timer,
  Variable,
  Merge,
  Bug,
  Box,
  MessageSquare,
  Radio,
  Send,
  Mail,
  PhoneCall,
  Github,
  Gitlab,
  Layers,
  BookOpen,
  Table,
  FileSpreadsheet,
  Database,
  HardDrive,
  Cpu,
  Binary,
  Shield,
  FileCode,
  Repeat,
  CreditCard,
  ShoppingBag,
  DollarSign,
  Contact,
  Cloud,
  CheckSquare,
  CheckCircle,
  Calendar,
  Folder,
  Filter,
  Calculator,
  Terminal,
  Activity,
  Server,
  Key,
  Flame,
  Bot,
  Video,
  FileText,
  Search,
} from 'lucide-react';

// ==========================================
// AUTHENTIC BRAND SVG ICONS
// ==========================================

export function OpenAIIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7866A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.6667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1635a.0804.0804 0 0 1-.038-.0567V6.0748a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.4598a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  );
}

export function AnthropicIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M13.827 3.5h3.407L24 20.5h-3.433l-1.92-4.482H11.38l-1.92 4.482H6.027L13.827 3.5Zm3.307 9.878L15.53 9.49l-1.603 3.888h3.207ZM3.433 20.5H0L7.773 3.5h3.433L3.433 20.5Z" />
    </svg>
  );
}

export function GeminiIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12Z" />
    </svg>
  );
}

export function OllamaIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="11" r="1.5" />
      <circle cx="15" cy="11" r="1.5" />
      <path d="M9 16c1.5 1 4.5 1 6 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 5L6 2M16 5l2-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function GroqIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.465l1.832-3.173A6.002 6.002 0 0 1 6 12c0-3.314 2.686-6 6-6s6 2.686 6 6c0 2.21-1.196 4.14-2.982 5.186l1.83 3.17C20.136 18.98 22 15.71 22 12c0-5.523-4.477-10-10-10Zm0 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    </svg>
  );
}

export function MistralIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <rect x="2" y="3" width="4" height="4" rx="0.5" />
      <rect x="18" y="3" width="4" height="4" rx="0.5" />
      <rect x="2" y="10" width="4" height="4" rx="0.5" />
      <rect x="10" y="10" width="4" height="4" rx="0.5" />
      <rect x="18" y="10" width="4" height="4" rx="0.5" />
      <rect x="2" y="17" width="4" height="4" rx="0.5" />
      <rect x="18" y="17" width="4" height="4" rx="0.5" />
    </svg>
  );
}

export function DeepSeekIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M2.5 14.5c2-4 6.5-7.5 12-6.5 3.5.6 6.5 3 7.5 6-3-2-6.5-2.5-9.5-1.5-3 1-5.5 3.5-7 5.5l-3-3.5Z" />
      <circle cx="8" cy="9.5" r="1.5" />
      <path d="M14.5 13c1.5 2.5 4 4 7 4.5-2 1.5-5 2-8 1-3.5-1.2-6-4-7-6.5 2.5 1 5.5 1.5 8 1Z" />
    </svg>
  );
}

export function CohereIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c4.14 0 7.71-2.52 9.24-6.14l-3.69-1.55C16.66 16.5 14.48 18 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c2.48 0 4.66 1.5 5.55 3.69l3.69-1.55C19.71 4.52 16.14 2 12 2Z" />
    </svg>
  );
}

export function PerplexityIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2L4 7v10l8 5 8-5V7l-8-5Zm0 2.5l5.5 3.5L12 11.5 6.5 8 12 4.5ZM5.5 9.2l5.5 3.5v6.8L5.5 16V9.2Zm13 0V16l-5.5 3.5v-6.8l5.5-3.5Z" />
    </svg>
  );
}

export function ElevenLabsIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <rect x="7" y="4" width="3.5" height="16" rx="1.75" />
      <rect x="13.5" y="4" width="3.5" height="16" rx="1.75" />
    </svg>
  );
}

export function HuggingFaceIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-3.5 6a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 8.5 8Zm7 0a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 15.5 8ZM12 17.5c-2.5 0-4.5-1.5-5.2-3.5h10.4c-.7 2-2.7 3.5-5.2 3.5Z" />
      <path d="M2 13c1 2 2.5 3 4 3.5M22 13c-1 2-2.5 3-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function SlackIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52-2.523 2.52 2.52 0 0 1 2.52-2.52h2.52v2.52c0 1.394-1.126 2.523-2.52 2.523Zm0-6.315H2.522A2.52 2.52 0 0 1 0 6.326C0 4.933 1.126 3.806 2.522 3.806a2.52 2.52 0 0 1 2.52 2.52v2.524Zm3.792 0a2.52 2.52 0 0 1 2.52-2.524 2.52 2.52 0 0 1 2.52 2.524v6.324a2.52 2.52 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.52-2.523V8.85Zm6.324-3.792c0-1.393 1.127-2.52 2.52-2.52a2.528 2.528 0 0 1 2.523 2.52c0 1.394-1.126 2.52-2.523 2.52h-2.52V5.058Zm0 3.792h2.52a2.52 2.52 0 0 1 2.523 2.524 2.528 2.528 0 0 1-2.523 2.52H15.158V8.85Zm-3.792 0a2.52 2.52 0 0 1 2.52 2.52v6.324a2.52 2.52 0 0 1-2.52 2.523 2.52 2.52 0 0 1-2.52-2.523V11.37a2.52 2.52 0 0 1 2.52-2.52Z" />
    </svg>
  );
}

export function DiscordIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function TelegramIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37Z" />
    </svg>
  );
}

export function StripeIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C17.652.793 15.353.4 12.52.4 6.944.4 3.23 3.374 3.23 8.354c0 6.643 8.283 5.485 8.283 8.878 0 .979-.865 1.488-2.158 1.488-2.585 0-5.32-1.258-7.147-2.348l-.9 5.578c2.09 1.157 5.074 1.706 7.994 1.706 5.86 0 9.778-2.925 9.778-7.986-.001-7.25-9.104-5.69-9.104-6.52Z" />
    </svg>
  );
}

export function ShopifyIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M19.78 6.55l-2.02-.6a.54.54 0 0 0-.48.11L14.7 8.38l-1.38-4.2a.58.58 0 0 0-.54-.4H9.46a.58.58 0 0 0-.58.58v.4L7.5 5.5l-3.28 1A.58.58 0 0 0 3.8 7l2.25 14.1a.58.58 0 0 0 .57.49h10.76a.58.58 0 0 0 .57-.49L20.2 7.14a.58.58 0 0 0-.42-.59ZM12 6.13l1.18 3.6-2.36.75V6.13Zm-2.36.42v3.74l-2.36-.75L9.64 6.55Z" />
    </svg>
  );
}

export function NotionIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M4.459 4.208c.746.606 1.026.56 2.424.466l11.092-.84c1.306-.093 1.586.28 1.213 1.213l-3.264 8.024v6.809c0 1.213-.466 1.586-1.586 1.68l-10.998.84c-1.12.093-1.68-.467-1.68-1.587V6.074c0-.933.28-1.306 2.799-1.866Zm4.198 3.824v8.49l4.572-8.397-3.453.28c-.84.093-1.119-.094-1.119-.373Z" />
    </svg>
  );
}

export function AirtableIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M11.4 1.5L1.8 5.4a.7.7 0 0 0 0 1.3l9.6 3.9a1.5 1.5 0 0 0 1.2 0l9.6-3.9a.7.7 0 0 0 0-1.3L12.6 1.5a1.5 1.5 0 0 0-1.2 0ZM1.5 9v11.8a.7.7 0 0 0 1 .6l9-3.9V9.7L2.1 8.8a.7.7 0 0 0-.6.2ZM12.5 17.5l9 3.9a.7.7 0 0 0 1-.6V9a.7.7 0 0 0-.6-.7L12.5 9.7v7.8Z" />
    </svg>
  );
}

export function PostgresIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm5.5 14.5c-.8.8-2.2 1.5-4 1.5-3.5 0-5.5-2.5-5.5-6s2-6 5.5-6c2.5 0 4 1.2 4.8 2.5l-1.8 1.2c-.6-.8-1.6-1.5-3-1.5-2.2 0-3.3 1.8-3.3 3.8s1.1 3.8 3.3 3.8c1.2 0 2.2-.5 2.8-1.2v-1.8H13.5v-2h6v5.5Z" />
    </svg>
  );
}

export function RedisIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2L2 7l10 5 10-5-10-5ZM2 12l10 5 10-5M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function SupabaseIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M11.956 0c.56 0 1.05.35 1.23.87l4.33 12.37a1.3 1.3 0 0 1-1.23 1.73h-5.2v8.16c0 .56-.35 1.05-.87 1.23a1.3 1.3 0 0 1-1.56-.47L3.456 10.7a1.3 1.3 0 0 1 .93-2.02h6.29V.87A1.3 1.3 0 0 1 11.956 0Z" />
    </svg>
  );
}

export function DockerIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M13 3h3v3h-3V3Zm-4 0h3v3H9V3ZM5 3h3v3H5V3Zm8 4h3v3h-3V7Zm-4 0h3v3H9V7ZM5 7h3v3H5V7Zm8 4h3v3h-3v-3Zm-4 0h3v3H9v-3ZM5 11h3v3H5v-3Zm14 1c-.3-1-1.3-1.6-2-1.5-1.5.1-2.5 1.5-2 3H1c-.6 0-1 .4-1 1 0 4.4 3.6 8 8 8 6.4 0 11.5-4.8 12-10.5h1.5c.3 0 .5-.2.5-.5 0-.5-.5-1.5-1-1.5h-1Z" />
    </svg>
  );
}

export function CloudflareIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M18.2 9.5c-.5-2.6-2.8-4.5-5.5-4.5-2.4 0-4.4 1.4-5.2 3.5C4.7 8.9 2.5 11.2 2.5 14c0 3 2.5 5.5 5.5 5.5h10.2c2.6 0 4.8-2.1 4.8-4.8 0-2.4-1.8-4.4-4.2-4.7-.2-.2-.4-.3-.6-.5Z" />
    </svg>
  );
}

export function AwsIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M6.2 11.8c-.8.8-1.2 1.7-1.2 2.7 0 1.8 1.4 3.2 3.2 3.2 1.3 0 2.4-.8 2.9-1.9v1.6h2.2V7.5h-2.2v1.5c-.6-1-1.7-1.7-2.9-1.7-1.8 0-3.2 1.4-3.2 3.2 0 1.1.4 2 1.2 2.8Zm3.2 3.9c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8 1.8.8 1.8 1.8-.8 1.8-1.8 1.8ZM21.5 17l-3.8-9.5h-2.4L19.1 17h2.4ZM2.5 21c6.5 2.5 13.5 1.5 19-1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function JiraIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M11.5 2.5L2 12l9.5 9.5 9.5-9.5-9.5-9.5Zm0 4.2L16.8 12 11.5 17.3 6.2 12 11.5 6.7Z" />
    </svg>
  );
}

export function LinearIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M3.2 3.2C1.5 4.9.4 7.2.1 9.8l14.1 14.1c2.6-.3 4.9-1.4 6.6-3.1L3.2 3.2Zm17.6 3.2L6.7.3C4.1.6 1.8 1.7.1 3.4l14.1 14.1c1.7-1.7 2.8-4 3.1-6.6L20.8 6.4Z" />
    </svg>
  );
}

export function SentryIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M13.5 2.5c4.7 1 8 5.2 8 10 0 5.8-4.7 10.5-10.5 10.5S.5 18.3.5 12.5c0-4.8 3.3-9 8-10l1.2 2.7C6.5 6 4 9 4 12.5 4 16.6 7.4 20 11.5 20s7.5-3.4 7.5-7.5c0-3.5-2.5-6.5-5.7-7.3L13.5 2.5Z" />
    </svg>
  );
}

export function PagerDutyIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M4 2.5h8.5c4.5 0 7.5 3 7.5 7.5s-3 7.5-7.5 7.5H8.5v4H4v-19Zm4.5 11h4c2.2 0 3.5-1.5 3.5-3.5S14.7 6.5 12.5 6.5h-4v7Z" />
    </svg>
  );
}

export function DigitalOceanIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2C6.5 2 2 6.5 2 12h4c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6v4c5.5 0 10-4.5 10-10S17.5 2 12 2Zm-4 14h-3v3h3v-3Zm-3 4H2v3h3v-3Z" />
    </svg>
  );
}

export function WhatsAppIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.95.56 3.77 1.53 5.32L2.5 21.5l4.33-.99C8.34 21.46 10.12 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Zm5.2 14.1c-.2.6-1.2 1.1-1.7 1.2-.5.1-1.1.2-3.3-.7-2.7-1.1-4.4-3.8-4.5-4-.1-.2-1.1-1.5-1.1-2.8 0-1.4.7-2 1-2.3.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5.2.5.7 1.7.8 1.8.1.2.1.3 0 .5-.1.2-.2.3-.3.4l-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.4 1.8 2.2 1.2 1.1 2.3 1.4 2.6 1.6.3.1.5.1.7-.1.2-.2.8-1 1.1-1.3.2-.3.5-.3.8-.2.3.1 1.9.9 2.2 1.1.3.1.5.2.6.4.1.2.1 1-.1 1.6Z" />
    </svg>
  );
}

export function TeamsIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M16 8h5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-5V8Zm-2-2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11V6Zm4.5-4a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM8.5 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
    </svg>
  );
}

export function TwitterXIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function RedditIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 2.22.73 4.27 1.97 5.93L2.5 21.5l3.8-.95C7.88 21.37 9.87 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Zm-3 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-3 6.5c-2 0-3.5-1-3.8-1.5h7.6c-.3.5-1.8 1.5-3.8 1.5Z" />
    </svg>
  );
}

export function ZoomIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M4 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm14 3.5l4-2.5v10l-4-2.5v-5Z" />
    </svg>
  );
}

export function ResendIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M3 5h18v14H3V5Zm2 2v1.5l7 4.5 7-4.5V7H5Zm0 3.5v6.5h14v-6.5l-7 4.5-7-4.5Z" />
    </svg>
  );
}

export function HubSpotIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M17.5 8V5.8a2.5 2.5 0 1 0-2 0V8a5.5 5.5 0 0 0-2.8 1.8l-5-3.9a2.5 2.5 0 1 0-1.4 1.7l4.8 3.8a5.5 5.5 0 1 0 6.4-3.4Zm-1 8.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z" />
    </svg>
  );
}

export function MailchimpIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2C6.5 2 2 6.5 2 12c0 2.5 1 4.8 2.5 6.5L3 21l3.5-1C8 21.2 9.9 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2Zm-3 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-3 7.5c-2.2 0-4-1.2-4.5-2.5h9c-.5 1.3-2.3 2.5-4.5 2.5Z" />
    </svg>
  );
}

export function SalesforceIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M10 4.5a5 5 0 0 1 4.5 2.8 4.5 4.5 0 0 1 4 2.7 4 4 0 0 1 3.5 4 4 4 0 0 1-4 4H5.5a4.5 4.5 0 0 1-4.5-4.5c0-2.2 1.6-4 3.7-4.4A5 5 0 0 1 10 4.5Z" />
    </svg>
  );
}

export function TypeformIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M4 6h16v3.5H13.8V20h-3.6V9.5H4V6Z" />
    </svg>
  );
}

export function MySQLIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2C6.5 2 2 6.5 2 12c0 4.8 3.5 8.8 8 9.8v-4.5c-.8 0-1.5-.5-1.8-1.2L7 16l-.8-2 2-1c.5-.3 1.1-.3 1.6 0l1.2.6V8.5a1.5 1.5 0 0 1 3 0v5.1l1.2-.6c.5-.3 1.1-.3 1.6 0l2 1-.8 2-1.2-.1c-.3.7-1 1.2-1.8 1.2v4.5c4.5-1 8-5 8-9.8 0-5.5-4.5-10-10-10Z" />
    </svg>
  );
}

export function MongoDBIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 1.5c-.5 2-4 5.5-4 10.5 0 4.5 2.5 8 4 10.5 1.5-2.5 4-6 4-10.5 0-5-3.5-8.5-4-10.5Z" />
    </svg>
  );
}

export function SQLiteIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <ellipse cx="12" cy="7" rx="8" ry="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M4 7v10c0 2.2 3.6 4 8 4s8-1.8 8-4V7" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M4 12c0 2.2 3.6 4 8 4s8-1.8 8-4" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function ElasticsearchIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M3 12h18M12 3c3 3 4.5 6 4.5 9s-1.5 6-4.5 9c-3-3-4.5-6-4.5-9s1.5-6 4.5-9Z" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function DropboxIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M6 3.5L12 7.5 6 11.5 0 7.5 6 3.5Zm12 0l6 4-6 4-6-4 6-4ZM0 15.5l6-4 6 4-6 4-6-4Zm24 0l-6-4-6 4 6 4 6-4ZM6 20.5l6-4 6 4-6 4-6-4Z" />
    </svg>
  );
}

export function GoogleDriveIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M7.7 3.5h8.6l5.2 9-4.3 7.5H8.6L3.4 12.5l4.3-9Zm1.5 2.6L4.9 12.5l3.5 6h7l4.3-7.4-4.3-7.6H9.2Z" />
    </svg>
  );
}

export function GoogleCalendarIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <rect x="3" y="4" width="18" height="17" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="15" r="1.5" />
    </svg>
  );
}

export function GoogleSheetsIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm-1 7V3.5L18.5 9H13ZM7 13h10v2H7v-2Zm0 4h10v2H7v-2Z" />
    </svg>
  );
}

export function PineconeIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2L4 7v10l8 5 8-5V7l-8-5Zm0 3.2L17.5 8 12 11.2 6.5 8 12 5.2Zm-6 4.3l5 3v5.8l-5-3v-5.8Zm12 0v5.8l-5 3v-5.8l5-3Z" />
    </svg>
  );
}

export function QdrantIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function ChromaIcon({ className = 'h-5 w-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

// ==========================================
// CENTRAL BRAND & NODE ICON RESOLVER
// ==========================================

export interface NodeIconProps extends React.SVGProps<SVGSVGElement> {
  nodeType?: string;
  iconName?: string;
  className?: string;
}

export function NodeIcon({ nodeType = '', iconName = '', className = 'h-5 w-5', ...props }: NodeIconProps) {
  const type = nodeType.toLowerCase();
  const icon = iconName.toLowerCase();

  // 1. AI & LLM Models
  if (type === 'ai.openai' || icon === 'openai' || icon === 'chatgpt') return <OpenAIIcon className={className} {...props} />;
  if (type === 'ai.anthropic' || icon === 'anthropic' || icon === 'claude') return <AnthropicIcon className={className} {...props} />;
  if (type === 'ai.gemini' || icon === 'gemini' || icon === 'google-ai') return <GeminiIcon className={className} {...props} />;
  if (type === 'connector.ollama' || icon === 'ollama') return <OllamaIcon className={className} {...props} />;
  if (type === 'connector.groq' || icon === 'groq') return <GroqIcon className={className} {...props} />;
  if (type === 'connector.mistral' || icon === 'mistral') return <MistralIcon className={className} {...props} />;
  if (type === 'connector.deepseek' || icon === 'deepseek') return <DeepSeekIcon className={className} {...props} />;
  if (type === 'connector.cohere' || icon === 'cohere') return <CohereIcon className={className} {...props} />;
  if (type === 'connector.perplexity' || icon === 'perplexity') return <PerplexityIcon className={className} {...props} />;
  if (type === 'connector.elevenlabs' || icon === 'elevenlabs') return <ElevenLabsIcon className={className} {...props} />;
  if (type === 'connector.huggingface' || icon === 'huggingface') return <HuggingFaceIcon className={className} {...props} />;
  if (type === 'connector.pinecone' || icon === 'pinecone') return <PineconeIcon className={className} {...props} />;
  if (type === 'connector.qdrant' || icon === 'qdrant') return <QdrantIcon className={className} {...props} />;
  if (type === 'connector.chroma' || icon === 'chroma') return <ChromaIcon className={className} {...props} />;

  // 2. Communication & Chat
  if (type === 'connector.slack' || type === 'trigger.slack' || icon === 'slack') return <SlackIcon className={className} {...props} />;
  if (type === 'connector.discord' || type === 'trigger.discord' || icon === 'discord') return <DiscordIcon className={className} {...props} />;
  if (type === 'connector.telegram' || type === 'trigger.telegram' || icon === 'telegram') return <TelegramIcon className={className} {...props} />;
  if (type === 'connector.whatsapp' || icon === 'whatsapp') return <WhatsAppIcon className={className} {...props} />;
  if (type === 'connector.teams' || icon === 'teams') return <TeamsIcon className={className} {...props} />;
  if (type === 'connector.resend' || icon === 'resend') return <ResendIcon className={className} {...props} />;
  if (type === 'connector.twitter' || icon === 'twitter' || icon === 'x') return <TwitterXIcon className={className} {...props} />;
  if (type === 'connector.reddit' || icon === 'reddit') return <RedditIcon className={className} {...props} />;
  if (type === 'connector.zoom' || icon === 'zoom') return <ZoomIcon className={className} {...props} />;

  // 3. Commerce & FinTech
  if (type === 'connector.stripe' || type === 'trigger.stripe' || icon === 'stripe') return <StripeIcon className={className} {...props} />;
  if (type === 'connector.shopify' || icon === 'shopify') return <ShopifyIcon className={className} {...props} />;
  if (type === 'connector.hubspot' || icon === 'hubspot') return <HubSpotIcon className={className} {...props} />;
  if (type === 'connector.mailchimp' || icon === 'mailchimp') return <MailchimpIcon className={className} {...props} />;
  if (type === 'connector.salesforce' || icon === 'salesforce') return <SalesforceIcon className={className} {...props} />;
  if (type === 'connector.typeform' || icon === 'typeform') return <TypeformIcon className={className} {...props} />;

  // 4. Developer Tools & DevOps
  if (type === 'connector.github' || type === 'trigger.github' || icon === 'github') return <Github className={className} {...props} />;
  if (type === 'connector.gitlab' || type === 'trigger.gitlab' || icon === 'gitlab') return <Gitlab className={className} {...props} />;
  if (type === 'connector.jira' || icon === 'jira') return <JiraIcon className={className} {...props} />;
  if (type === 'connector.linear' || icon === 'linear') return <LinearIcon className={className} {...props} />;
  if (type === 'connector.docker' || icon === 'docker') return <DockerIcon className={className} {...props} />;
  if (type === 'connector.cloudflare' || icon === 'cloudflare') return <CloudflareIcon className={className} {...props} />;
  if (type === 'connector.digitalocean' || icon === 'digitalocean') return <DigitalOceanIcon className={className} {...props} />;
  if (type === 'connector.sentry' || icon === 'sentry') return <SentryIcon className={className} {...props} />;
  if (type === 'connector.pagerduty' || icon === 'pagerduty') return <PagerDutyIcon className={className} {...props} />;

  // 5. Productivity & Workspace
  if (type === 'connector.notion' || type === 'trigger.notion' || icon === 'notion') return <NotionIcon className={className} {...props} />;
  if (type === 'connector.airtable' || type === 'trigger.airtable' || icon === 'airtable') return <AirtableIcon className={className} {...props} />;
  if (type === 'connector.googledrive' || icon === 'googledrive') return <GoogleDriveIcon className={className} {...props} />;
  if (type === 'connector.googlecalendar' || icon === 'googlecalendar') return <GoogleCalendarIcon className={className} {...props} />;
  if (type === 'connector.googledocs' || type === 'connector.googlesheets' || icon === 'googlesheets') return <GoogleSheetsIcon className={className} {...props} />;

  // 6. Databases & Storage
  if (type === 'connector.postgres' || icon === 'postgres') return <PostgresIcon className={className} {...props} />;
  if (type === 'connector.mysql' || icon === 'mysql') return <MySQLIcon className={className} {...props} />;
  if (type === 'connector.redis' || icon === 'redis') return <RedisIcon className={className} {...props} />;
  if (type === 'connector.supabase' || icon === 'supabase') return <SupabaseIcon className={className} {...props} />;
  if (type === 'connector.s3' || type === 'connector.awslambda' || icon === 'aws' || icon === 's3') return <AwsIcon className={className} {...props} />;
  if (type === 'connector.mongodb' || icon === 'mongodb') return <MongoDBIcon className={className} {...props} />;
  if (type === 'connector.sqlite' || icon === 'sqlite') return <SQLiteIcon className={className} {...props} />;
  if (type === 'connector.elasticsearch' || icon === 'elasticsearch') return <ElasticsearchIcon className={className} {...props} />;
  if (type === 'connector.dropbox' || icon === 'dropbox') return <DropboxIcon className={className} {...props} />;

  // 7. Core Triggers, Logic & Actions
  if (type === 'trigger.webhook' || icon === 'webhook' || icon === 'globe') return <Globe className={className} {...props} />;
  if (type === 'trigger.manual' || icon === 'play') return <Play className={className} {...props} />;
  if (type === 'trigger.schedule' || icon === 'clock' || icon === 'timer') return <Clock className={className} {...props} />;
  if (type === 'action.http' || icon === 'globe2') return <Globe className={className} {...props} />;
  if (type === 'action.code' || icon === 'code' || icon === 'code2') return <Code2 className={className} {...props} />;
  if (type === 'action.ssh' || icon === 'ssh' || icon === 'terminal') return <Terminal className={className} {...props} />;
  if (type === 'action.delay') return <Timer className={className} {...props} />;
  if (type === 'logic.condition' || icon === 'gitbranch') return <GitBranch className={className} {...props} />;
  if (type === 'logic.merge' || icon === 'merge') return <Merge className={className} {...props} />;
  if (type === 'logic.loop' || icon === 'repeat') return <Repeat className={className} {...props} />;
  if (type === 'data.transform' || icon === 'shuffle') return <Shuffle className={className} {...props} />;
  if (type === 'data.setvariable' || icon === 'variable') return <Variable className={className} {...props} />;
  if (type === 'util.debug' || icon === 'bug') return <Bug className={className} {...props} />;

  // Fallbacks
  return <Box className={className} {...props} />;
}
