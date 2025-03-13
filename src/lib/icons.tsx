'use client';

import * as LucideIcons from 'lucide-react';
import { IconWrapper } from '@/components/ui/IconWrapper';

// Mapeo de iconos de react-icons/fi a Lucide React
export const iconMap = {
  // Navegación y UI
  FiHome: LucideIcons.Home,
  FiUser: LucideIcons.User,
  FiUsers: LucideIcons.Users,
  FiLogOut: LucideIcons.LogOut,
  FiMenu: LucideIcons.Menu,
  FiX: LucideIcons.X,
  FiEdit: LucideIcons.Edit,
  FiEdit2: LucideIcons.Edit2,
  FiTrash2: LucideIcons.Trash2,
  FiEye: LucideIcons.Eye,
  FiCopy: LucideIcons.Copy,
  FiSearch: LucideIcons.Search,
  FiLoader: LucideIcons.Loader,
  FiAlertTriangle: LucideIcons.AlertTriangle,
  FiCheck: LucideIcons.Check,
  
  // Comunicación
  FiMail: LucideIcons.Mail,
  FiMessageSquare: LucideIcons.MessageSquare,
  FiPhone: LucideIcons.Phone,
  
  // Redes sociales
  FiInstagram: LucideIcons.Instagram,
  FiTwitter: LucideIcons.Twitter,
  
  // Documentos y contenido
  FiBook: LucideIcons.BookOpen,
  FiVideo: LucideIcons.Video,
  FiFileText: LucideIcons.FileText,
  FiHelpCircle: LucideIcons.HelpCircle,
  
  // Fitness y salud
  FiActivity: LucideIcons.Activity,
  FiHeart: LucideIcons.Heart,
  FiAward: LucideIcons.Award,
  FiTarget: LucideIcons.Target,
  FiTrendingUp: LucideIcons.TrendingUp,
  
  // Otros
  FiMapPin: LucideIcons.MapPin,
  FiCalendar: LucideIcons.Calendar,
  FiTag: LucideIcons.Tag,
  FiShield: LucideIcons.Shield,
  FiUserPlus: LucideIcons.UserPlus,
  FiSun: LucideIcons.Sun,
  FiMoon: LucideIcons.Moon
};

// Componentes de iconos pre-envueltos para uso directo
export const Icons = Object.entries(iconMap).reduce((acc, [fiName, LucideIcon]) => {
  acc[fiName] = (props: { className?: string }) => (
    <IconWrapper icon={LucideIcon} className={props.className} />
  );
  return acc;
}, {} as Record<string, (props: { className?: string }) => JSX.Element>);

// Función para obtener un icono de Lucide equivalente a un icono de react-icons/fi
export function getLucideIcon(fiIconName: string) {
  return iconMap[fiIconName as keyof typeof iconMap] || LucideIcons.HelpCircle;
} 